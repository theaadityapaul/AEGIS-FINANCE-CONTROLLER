import streamlit as st
import json
import pandas as pd
from qa_agent import ask_finance_controller

st.set_page_config(page_title="Aegis | AI Finance Controller", page_icon="🛡️", layout="wide")

# Load Audit Data
with open("reconciliation_report.json", "r") as f:
    report = json.load(f)

st.title("🛡️ Aegis: Autonomous Finance Controller")
st.caption(f"Batch Execution: `{report['batch_id']}` | Autonomous Multi-Source Reconciliation")

# Key Metrics
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Batch Records", report["total_records_processed"])
col2.metric("Matched Records", report["matched_records"])
col3.metric("Honest Exceptions", report["exceptions_flagged"], delta="-Requires Review", delta_color="inverse")
col4.metric("Match Accuracy Rate", f"{report['match_rate_percentage']}%")

st.divider()

# Tab Navigation
tab1, tab2, tab3 = st.tabs(["📊 Reconciliation Matrix", "⚠️ Honest Exception List", "💬 Settlement Q&A Agent"])

df_results = pd.DataFrame(report["results"])

with tab1:
    st.subheader("Reconciled Batch Records")
    match_filter = st.multiselect(
        "Filter by Match Type",
        options=df_results["match_type"].unique(),
        default=df_results["match_type"].unique()
    )
    filtered_df = df_results[df_results["match_type"].isin(match_filter)]
    st.dataframe(filtered_df, use_container_width=True)

with tab2:
    st.subheader("Honest Exception Audit Feed")
    df_exceptions = pd.DataFrame(report["honest_exception_list"])
    if not df_exceptions.empty:
        for _, row in df_exceptions.iterrows():
            with st.expander(f"🚨 {row['transaction_id']} — Status: {row['match_type']}"):
                st.write(f"**Expected Amount:** ${row['expected_amount']}")
                st.write(f"**Confidence:** {row['confidence_score']}")
                st.warning(f"**Audit Note:** {row['audit_notes']}")
    else:
        st.success("No unresolved exceptions in this batch.")

with tab3:
    st.subheader("Settlement & Reconciliation Q&A")
    st.caption("Ask questions about specific anomalies, gateway fee deductions, or audit decisions.")
    
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if user_prompt := st.chat_input("Ask Aegis (e.g., 'Why did INV-1003 fail reconciliation?')"):
        st.session_state.messages.append({"role": "user", "content": user_prompt})
        with st.chat_message("user"):
            st.markdown(user_prompt)

        with st.chat_message("assistant"):
            with st.spinner("Analyzing batch ledger and audit trail..."):
                response = ask_finance_controller(user_prompt)
                st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})