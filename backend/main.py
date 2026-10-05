from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.privacy_routes import (
    router as privacy_router
)

from api.chat_routes import (
    router as chat_router
)

from api.transaction_routes import (
    router as transaction_router
)


app = FastAPI(
    title="Bitcoin Privacy Assistant",
    description=(
        "Bitcoin privacy analysis and "
        "AI educational assistant"
    ),
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


app.include_router(
    privacy_router
)

app.include_router(
    chat_router
)

app.include_router(
    transaction_router
)


@app.get("/api/health")
def health_check():

    return {

        "status": "ok",

        "message":
            (
                "Bitcoin Privacy Assistant "
                "backend is running"
            )
    }