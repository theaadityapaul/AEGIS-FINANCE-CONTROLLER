import os
import json
import uuid
import pandas as pd
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from schema import MatchType, ReconciledRecord, ReconciliationReport

load_dotenv()

# 1. Load Data
ledger_df = pd.read_csv("internal_ledger.csv")
bank_df = pd.read_csv("bank_statement.csv")

print(f"Loaded {len(ledger_df)} ledger records and {len(bank_df)} bank records.")

# 2. Stage 1: Deterministic Fast-Path Filter
def run_deterministic_filter(ledger: pd.DataFrame, bank: pd.DataFrame):
    resolved = []
    unresolved_ledger = []
    unmatched_bank = bank.copy()

    for _, row in ledger.iterrows():
        mask = (
            unmatched_bank["Description"].str.contains(row["Transaction_ID"], na=False) &
            (unmatched_bank["Deposit_Amount"] == row["Expected_Amount"]) &
            (unmatched_bank["Date"] == row["Date"])
        )
        matches = unmatched_bank[mask]

        if not matches.empty:
            matched_row = matches.iloc[0]
            resolved.append(ReconciledRecord(
                transaction_id=row["Transaction_ID"],
                bank_reference=matched_row["Bank_Reference"],
                match_type=MatchType.EXACT_MATCH,
                confidence_score=1.0,
                expected_amount=float(row["Expected_Amount"]),
                settled_amount=float(matched_row["Deposit_Amount"]),
                variance_amount=0.0,
                audit_notes="Exact match confirmed across ID, Date, and Amount."
            ))
            unmatched_bank = unmatched_bank.drop(matched_row.name)
        else:
            unresolved_ledger.append(row.to_dict())

    return resolved, pd.DataFrame(unresolved_ledger), unmatched_bank


# 3. Stage 2: Agentic Auditor Schema & Execution
class AgentResolution(BaseModel):
    resolutions: list[ReconciledRecord] = Field(description="List of AI-reconciled records and classified exceptions")

def run_agentic_auditor(unresolved_ledger_df: pd.DataFrame, remaining_bank_df: pd.DataFrame):
    if unresolved_ledger_df.empty:
        return []

    print("\nInitiating Stage 2: Agentic Auditor (Gemini 1.5 Pro)...")

    ledger_json = unresolved_ledger_df.to_json(orient="records")
    bank_json = remaining_bank_df.to_json(orient="records")

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in environment or .env file.")

    llm = ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        temperature=0,
        google_api_key=api_key
    )
    structured_llm = llm.with_structured_output(AgentResolution)

    system_prompt = """
    You are an enterprise Autonomous Finance Controller. Your goal is multi-source reconciliation 
    between internal ledger records and bank statement records.

    Classification Rules:
    1. EXACT_MATCH: Identical transaction details.
    2. FEE_VARIANCE: Bank deposit is ~3% lower than Expected_Amount due to payment gateway charges. Calculate variance_amount = expected_amount - settled_amount.
    3. DATE_SLIPPAGE: Deposit matches amount and Transaction_ID, but date is 1-5 days later due to settlement latency.
    4. UNRESOLVED: If records have missing reference IDs, untraceable deposits, or mathematical mismatch, mark as UNRESOLVED. Set bank_reference to None if no match is found, and explain clearly in audit_notes.

    Be conservative and honest. Never hallucinate matches.
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Analyze these unmatched records and output structured audit results.\n\nLedger:\n{ledger_data}\n\nBank Statement:\n{bank_data}")
    ])

    chain = prompt | structured_llm
    result = chain.invoke({
        "ledger_data": ledger_json,
        "bank_data": bank_json
    })

    return result.resolutions


# 4. Pipeline Execution & Final Report Generation
if __name__ == "__main__":
    exact_matches, remaining_ledger, remaining_bank = run_deterministic_filter(ledger_df, bank_df)
    print(f"Stage 1 Complete: {len(exact_matches)} exact matches resolved. {len(remaining_ledger)} escalated.")

    agent_resolutions = run_agentic_auditor(remaining_ledger, remaining_bank)
    
    all_results = exact_matches + agent_resolutions
    matched = [r for r in all_results if r.match_type != MatchType.UNRESOLVED_EXCEPTION]
    exceptions = [r for r in all_results if r.match_type == MatchType.UNRESOLVED_EXCEPTION]

    match_rate = (len(matched) / len(ledger_df)) * 100 if len(ledger_df) > 0 else 0.0

    report = ReconciliationReport(
        batch_id=f"BATCH-{uuid.uuid4().hex[:8].upper()}",
        total_records_processed=len(ledger_df),
        matched_records=len(matched),
        exceptions_flagged=len(exceptions),
        match_rate_percentage=round(match_rate, 2),
        results=all_results,
        honest_exception_list=exceptions
    )

    with open("reconciliation_report.json", "w") as f:
        f.write(report.model_dump_json(indent=2))

    print("\n========================================================")
    print(f"   RECONCILIATION AUDIT COMPLETED: {report.batch_id}")
    print("========================================================")
    print(f"Total Processed     : {report.total_records_processed}")
    print(f"Matched Records     : {report.matched_records}")
    print(f"Exceptions Flagged  : {report.exceptions_flagged}")
    print(f"Match Rate          : {report.match_rate_percentage}%")
    print(f"Exported Report     : reconciliation_report.json")
    print("========================================================\n")

    if exceptions:
        print("--- Honest Exception Sample ---")
        for exc in exceptions[:3]:
            print(f"TXN: {exc.transaction_id} | Note: {exc.audit_notes}")