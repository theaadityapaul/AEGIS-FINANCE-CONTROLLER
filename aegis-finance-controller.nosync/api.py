from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from qa_agent import ask_finance_controller

app = FastAPI()

# Allow Next.js (localhost:3000) to communicate with this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

@app.post("/api/chat")
async def chat_endpoint(query: Query):
    try:
        # Pass the human's question to your Gemini 3.6 Flash agent
        answer = ask_finance_controller(query.question)
        return {"role": "ai", "content": answer}
    except Exception as e:
        return {"role": "ai", "content": f"Neural Link Failed: {str(e)}"}