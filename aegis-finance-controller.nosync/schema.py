from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class MatchType(str, Enum):
    EXACT_MATCH = "EXACT_MATCH"
    FEE_VARIANCE = "FEE_VARIANCE"          # e.g., 3% Payment Gateway fee deducted
    DATE_SLIPPAGE = "DATE_SLIPPAGE"        # Settlement delay of 2-5 days
    UNRESOLVED_EXCEPTION = "UNRESOLVED"   # Missing metadata or mismatch

class ReconciledRecord(BaseModel):
    transaction_id: str = Field(description="Internal ledger invoice ID (e.g. INV-1001)")
    bank_reference: Optional[str] = Field(None, description="Matched bank reference number")
    match_type: MatchType = Field(description="Category of the match outcome")
    confidence_score: float = Field(description="Confidence between 0.0 and 1.0")
    expected_amount: float = Field(description="Amount listed in internal ledger")
    settled_amount: Optional[float] = Field(None, description="Actual amount found in bank statement")
    variance_amount: float = Field(0.0, description="Difference between expected and settled")
    audit_notes: str = Field(description="Reasoning explaining why this match was made or why it failed")

class ReconciliationReport(BaseModel):
    batch_id: str
    total_records_processed: int
    matched_records: int
    exceptions_flagged: int
    match_rate_percentage: float
    results: List[ReconciledRecord]
    honest_exception_list: List[ReconciledRecord]