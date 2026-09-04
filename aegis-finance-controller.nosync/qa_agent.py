import os
import json
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# Load the generated audit report
with open("reconciliation_report.json", "r") as f:
    report_data = json.load(f)

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash",
    temperature=0,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

system_prompt = """
You are the Aegis Autonomous Settlement & Audit Q&A Agent.
You have complete visibility into the latest reconciliation batch audit report:

Batch Summary:
- Batch ID: {batch_id}
- Total Records: {total}
- Matched: {matched}
- Exceptions Flagged: {exceptions}
- Match Rate: {match_rate}%

Full Audit Records:
{audit_records}

Instructions:
1. Answer questions from finance controllers, CFOs, or auditors regarding transaction statuses, variances, fees, date slippage, or unresolved exceptions.
2. Provide concise, mathematically verified explanations citing transaction IDs and audit notes.
3. If an anomaly is due to missing metadata or fee deductions, explain the precise financial impact.
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{question}")
])

chain = prompt_template | llm

def ask_finance_controller(question: str) -> str:
    response = chain.invoke({
        "batch_id": report_data["batch_id"],
        "total": report_data["total_records_processed"],
        "matched": report_data["matched_records"],
        "exceptions": report_data["exceptions_flagged"],
        "match_rate": report_data["match_rate_percentage"],
        "audit_records": json.dumps(report_data["results"], indent=2),
        "question": question
    })
    return response.content

if __name__ == "__main__":
    print("--- Aegis Settlement Q&A Interface (type 'exit' to quit) ---")
    while True:
        user_query = input("\nEnter audit question: ")
        if user_query.strip().lower() in ["exit", "quit"]:
            break
        answer = ask_finance_controller(user_query)
        print(f"\nAegis Controller:\n{answer}")