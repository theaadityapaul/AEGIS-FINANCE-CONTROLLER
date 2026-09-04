import pandas as pd
import random
from datetime import datetime, timedelta
import uuid

# Configuration
NUM_RECORDS = 50
BASE_DATE = datetime(2026, 8, 20)

ledger_data = []
bank_data = []

for i in range(NUM_RECORDS):
    # Base Data
    txn_id = f"INV-{1000 + i}"
    amount = round(random.uniform(100.0, 5000.0), 2)
    customer = f"Customer_{uuid.uuid4().hex[:4].upper()}"
    base_date = BASE_DATE + timedelta(days=random.randint(0, 5))
    
    # 1. Base Ledger Entry
    ledger_data.append({
        "Transaction_ID": txn_id,
        "Date": base_date.strftime("%Y-%m-%d"),
        "Expected_Amount": amount,
        "Customer_Name": customer
    })
    
    # Determine the scenario for the Bank Statement
    scenario_roll = random.random()
    
    if scenario_roll < 0.60:
        # Scenario A: Exact Match (60%)
        bank_data.append({
            "Bank_Reference": f"BNK-{uuid.uuid4().hex[:6].upper()}",
            "Date": base_date.strftime("%Y-%m-%d"),
            "Deposit_Amount": amount,
            "Description": f"SETTLEMENT FOR {txn_id} {customer}"
        })
    elif scenario_roll < 0.80:
        # Scenario B: Gateway Fee Deduction of 3% (20%)
        fee_amount = round(amount * 0.97, 2)
        bank_data.append({
            "Bank_Reference": f"BNK-{uuid.uuid4().hex[:6].upper()}",
            "Date": base_date.strftime("%Y-%m-%d"),
            "Deposit_Amount": fee_amount,
            "Description": f"PG-SETTLEMENT {txn_id} (LESS FEES)"
        })
    elif scenario_roll < 0.90:
        # Scenario C: Date Slippage / Delayed Settlement (10%)
        delayed_date = base_date + timedelta(days=random.randint(2, 4))
        bank_data.append({
            "Bank_Reference": f"BNK-{uuid.uuid4().hex[:6].upper()}",
            "Date": delayed_date.strftime("%Y-%m-%d"),
            "Deposit_Amount": amount,
            "Description": f"DELAYED SETTLEMENT {txn_id}"
        })
    else:
        # Scenario D: Missing Metadata / Messy Description (10%)
        bank_data.append({
            "Bank_Reference": f"BNK-{uuid.uuid4().hex[:6].upper()}",
            "Date": base_date.strftime("%Y-%m-%d"),
            "Deposit_Amount": amount,
            "Description": f"WIRE TRANSFER RECV - REF UNAVAILABLE"
        })

# Export to CSV
pd.DataFrame(ledger_data).to_csv("internal_ledger.csv", index=False)
pd.DataFrame(bank_data).to_csv("bank_statement.csv", index=False)

print("✅ Synthetic data generated successfully: 'internal_ledger.csv' and 'bank_statement.csv'")