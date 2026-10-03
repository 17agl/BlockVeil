import os
import httpx
from dotenv import load_dotenv

load_dotenv()

MEMPOOL_API_URL = os.getenv(
    "MEMPOOL_API_URL",
    "https://mempool.space/api"
)


async def get_address_info(address: str):
    url = f"{MEMPOOL_API_URL}/address/{address}"

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url)

    response.raise_for_status()

    return response.json()


async def get_address_transactions(address: str):
    url = f"{MEMPOOL_API_URL}/address/{address}/txs"

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url)

    response.raise_for_status()

    return response.json()