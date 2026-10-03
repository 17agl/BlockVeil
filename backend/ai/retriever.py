from pathlib import Path
import re


KNOWLEDGE_PATH = (
    Path(__file__).resolve().parent.parent / "knowledge"
)


def tokenize(text: str):
    """
    Convert text into simple lowercase tokens.
    """

    return set(
        re.findall(
            r"[a-zA-Z0-9]+",
            text.lower()
        )
    )


def load_documents():
    """
    Load all Markdown files from the knowledge base.
    """

    documents = []

    for path in KNOWLEDGE_PATH.rglob("*.md"):

        content = path.read_text(
            encoding="utf-8"
        )

        documents.append({
            "title": path.stem.replace("-", " ").title(),
            "path": str(
                path.relative_to(KNOWLEDGE_PATH)
            ),
            "content": content,
            "tokens": tokenize(content)
        })

    return documents


def calculate_relevance(
    question_tokens,
    document_tokens
):
    """
    Simple keyword-overlap retrieval score.
    """

    if not question_tokens:
        return 0

    overlap = question_tokens.intersection(
        document_tokens
    )

    return len(overlap)


def retrieve_documents(
    question: str,
    top_k: int = 3
):

    question_tokens = tokenize(question)

    documents = load_documents()

    scored_documents = []

    for document in documents:

        score = calculate_relevance(
            question_tokens,
            document["tokens"]
        )

        if score > 0:

            scored_documents.append({
                "title": document["title"],
                "path": document["path"],
                "content": document["content"],
                "score": score
            })

    scored_documents.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return scored_documents[:top_k]