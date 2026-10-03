from pydantic import BaseModel
from typing import Optional


class PrivacyFlag(BaseModel):
    rule: str
    detected: bool
    severity: str
    message: str
    details: Optional[dict] = None


class PrivacyReport(BaseModel):
    address: str
    transaction_count: int
    score: int
    rating: str
    flags: list[PrivacyFlag]