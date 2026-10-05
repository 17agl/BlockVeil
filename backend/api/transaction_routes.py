from fastapi import (
    APIRouter,
    HTTPException
)

import httpx
import os

from dotenv import load_dotenv


load_dotenv()


router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"]
)


MEMPOOL_API_URL = os.getenv(
    "MEMPOOL_API_URL",
    "https://mempool.space/api"
)


@router.get("/{txid}")
async def get_transaction(
    txid: str
):

    if not txid.strip():

        raise HTTPException(
            status_code=400,
            detail="Transaction ID is required."
        )

    url = (
        f"{MEMPOOL_API_URL}/tx/"
        f"{txid}"
    )

    try:

        async with httpx.AsyncClient(
            timeout=20
        ) as client:

            response = await client.get(
                url
            )

            if response.status_code == 404:

                raise HTTPException(
                    status_code=404,
                    detail="Transaction not found."
                )

            response.raise_for_status()

            return response.json()

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )