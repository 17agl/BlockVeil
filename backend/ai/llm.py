import os

from dotenv import load_dotenv
from openai import OpenAI

from .prompts import SYSTEM_PROMPT


load_dotenv()


api_key = os.getenv("OPENAI_API_KEY")


if api_key:
    client = OpenAI(
        api_key=api_key
    )
else:
    client = None


MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-6-luna"
)


def generate_answer(
    question: str,
    documents: list
):

    if client is None:

        raise RuntimeError(
            "OPENAI_API_KEY is not configured."
        )


    if not documents:

        context = (
            "No relevant knowledge-base "
            "documents were found."
        )

    else:

        context_parts = []

        for document in documents:

            context_parts.append(
                f"""
SOURCE: {document["path"]}

{document["content"]}
"""
            )

        context = "\n".join(
            context_parts
        )


    user_prompt = f"""
KNOWLEDGE BASE CONTEXT
======================

{context}

======================

USER QUESTION
=============

{question}

======================

Answer the user's question using only
the supplied knowledge context.
"""


    response = client.responses.create(
        model=MODEL,
        instructions=SYSTEM_PROMPT,
        input=user_prompt
    )


    return response.output_text