from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from blockchain.mempool_client import (
    get_address_transactions,
    validate_address,
    get_network_status
)

from privacy.analyzer import analyze_address
from privacy.validation import validate_input_security, is_valid_bitcoin_address_syntax

from ai.retriever import retrieve_documents
from ai.llm import generate_privacy_explanation


router = APIRouter(
    prefix="/api/privacy",
    tags=["Privacy Analyzer"]
)


class AddressRequest(BaseModel):
    address: str


class PrivacyExplainRequest(BaseModel):
    report: dict


@router.get("/network-status")
async def network_status():
    """Fetch live Mempool and Bitcoin network status."""
    try:
        return await get_network_status()
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch network status: {str(err)}"
        )


@router.post("/analyze")
async def analyze(request: AddressRequest):
    address = request.address.strip()

    if not address:
        raise HTTPException(
            status_code=400,
            detail="Bitcoin address is required."
        )

    # Security check: ensure user did not enter a seed phrase, private key, or nsec key
    try:
        validate_input_security(address)
    except ValueError as sec_err:
        raise HTTPException(
            status_code=400,
            detail=str(sec_err)
        )

    # Syntax check
    if not is_valid_bitcoin_address_syntax(address):
        raise HTTPException(
            status_code=400,
            detail="Invalid Bitcoin address format. Please enter a valid public address (e.g. 1..., 3..., bc1q..., or bc1p...)."
        )

    try:
        is_valid = await validate_address(address)
        if not is_valid:
            raise HTTPException(
                status_code=400,
                detail="Mempool validation failed: invalid Bitcoin address."
            )

        transactions = await get_address_transactions(address)

    except HTTPException:
        raise
    except ValueError as val_err:
        raise HTTPException(
            status_code=400,
            detail=str(val_err)
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"Blockchain service error: {str(error)}"
        )

    try:
        report = analyze_address(address, transactions)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to analyze address: {str(error)}"
        )

    return report


@router.post("/explain")
async def explain_privacy(request: PrivacyExplainRequest):
    report = request.report

    if not report:
        raise HTTPException(
            status_code=400,
            detail="Privacy report is required."
        )

    score = report.get("score")
    if score is None:
        raise HTTPException(
            status_code=400,
            detail="Privacy score is missing from report."
        )

    flags = report.get("flags", [])
    query_parts = ["Bitcoin privacy analysis"]

    for flag in flags:
        if flag.get("detected"):
            query_parts.append(str(flag.get("rule", "")))
            query_parts.append(str(flag.get("title", "")))
            query_parts.append(str(flag.get("message", "")))

    retrieval_query = " ".join(query_parts)
    documents = retrieve_documents(retrieval_query, top_k=4)

    try:
        explanation = generate_privacy_explanation(report, documents)
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Explanation generation error: {str(error)}"
        )

    sources = [
        {
            "title": doc.get("title"),
            "path": doc.get("path"),
            "score": doc.get("score")
        }
        for doc in documents
    ]

    return {
        "explanation": explanation,
        "sources": sources
    }