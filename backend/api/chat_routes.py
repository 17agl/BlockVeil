from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai.retriever import retrieve_documents
from ai.llm import generate_answer


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Assistant"]
)


class ChatRequest(BaseModel):

    question: str


@router.post("")
async def chat(request: ChatRequest):

    question = request.question.strip()

    if not question:

        raise HTTPException(
            status_code=400,
            detail="Question is required."
        )


    documents = retrieve_documents(
        question,
        top_k=3
    )


    try:

        answer = generate_answer(
            question,
            documents
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    sources = [
        {
            "title": document["title"],
            "path": document["path"],
            "score": document["score"]
        }
        for document in documents
    ]


    return {
        "question": question,
        "answer": answer,
        "sources": sources
    }