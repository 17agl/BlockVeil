from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from blockchain.mempool_client import (
    get_address_info,
    get_address_transactions
)

from privacy.analyzer import analyze_address


router = APIRouter(
    prefix="/api/privacy",
    tags=["Privacy"]
)


class AddressRequest(BaseModel):
    address: str


@router.post("/analyze")
async def analyze(request: AddressRequest):

    address = request.address.strip()

    if not address:
        raise HTTPException(
            status_code=400,
            detail="Bitcoin address is required."
        )

    try:
        transactions = await get_address_transactions(address)

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to fetch address data: {str(error)}"
        )

    report = analyze_address(
        address,
        transactions
    )

    return report