from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai.retriever import retrieve_documents
from ai.llm import generate_answer
from privacy.validation import validate_input_security


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Assistant"]
)


class ChatRequest(BaseModel):
    question: str
    active_report: Optional[Dict[str, Any]] = None


@router.post("")
async def chat(request: ChatRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required."
        )

    # Security check
    try:
        validate_input_security(question)
    except ValueError as sec_err:
        raise HTTPException(
            status_code=400,
            detail=str(sec_err)
        )

    # If an active privacy report context is attached, add report terms to document retrieval query
    retrieval_query = question
    if request.active_report:
        report_terms = []
        for flag in request.active_report.get("flags", []):
            if flag.get("detected"):
                report_terms.append(flag.get("title", ""))
        if report_terms:
            retrieval_query += " " + " ".join(report_terms)

    documents = retrieve_documents(retrieval_query, top_k=4)

    try:
        answer = generate_answer(
            question,
            documents,
            active_report=request.active_report
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Assistant processing error: {str(error)}"
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
        "question": question,
        "answer": answer,
        "sources": sources
    }