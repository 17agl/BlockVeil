from pathlib import Path
import re
import math
from typing import List, Dict, Any

KNOWLEDGE_PATH = (
    Path(__file__).resolve().parent.parent / "knowledge"
)

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "to", "for", "from", "with", "by", "about", "against",
    "between", "into", "through", "during", "before", "after", "above", "below",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am",
    "how", "why", "where", "when", "does", "do", "did", "doing", "would",
    "should", "could", "ought", "i", "you", "he", "she", "it", "we", "they",
    "and", "but", "if", "or", "because", "as", "until", "while", "of", "or"
}


def tokenize(text: str) -> List[str]:
    """Tokenize text into lowercased alpha-numeric terms, filtering out stop words."""
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return [w for w in words if w not in STOP_WORDS and len(w) > 1]


def chunk_document(content: str, title: str, path_str: str) -> List[Dict[str, Any]]:
    """
    Split markdown document into section chunks based on headers.
    """
    sections = re.split(r"(^|\n)(?=#+\s+)", content)
    chunks = []

    for idx, section in enumerate(sections):
        cleaned_sec = section.strip()
        if not cleaned_sec:
            continue

        # Find header title if present
        header_match = re.match(r"^#+\s+(.+)$", cleaned_sec, re.MULTILINE)
        section_title = header_match.group(1).strip() if header_match else title

        chunks.append({
            "title": title,
            "section_title": section_title,
            "path": path_str,
            "chunk_id": f"{path_str}#section-{idx}",
            "content": cleaned_sec,
            "tokens": tokenize(cleaned_sec),
            "header_tokens": tokenize(section_title)
        })

    if not chunks:
        chunks.append({
            "title": title,
            "section_title": title,
            "path": path_str,
            "chunk_id": path_str,
            "content": content,
            "tokens": tokenize(content),
            "header_tokens": tokenize(title)
        })

    return chunks


def load_knowledge_chunks() -> List[Dict[str, Any]]:
    chunks = []
    for path in KNOWLEDGE_PATH.rglob("*.md"):
        content = path.read_text(encoding="utf-8")
        title = path.stem.replace("-", " ").title()
        rel_path = str(path.relative_to(KNOWLEDGE_PATH))
        doc_chunks = chunk_document(content, title, rel_path)
        chunks.extend(doc_chunks)
    return chunks


def calculate_bm25_score(
    query_tokens: List[str],
    chunk: Dict[str, Any],
    total_chunks: int,
    doc_freqs: Dict[str, int],
    avg_dl: float
) -> float:
    """
    Compute BM25 / TF-IDF relevance score for a query against a document chunk.
    Includes bonus weight for header matches.
    """
    k1 = 1.5
    b = 0.75
    score = 0.0

    chunk_tokens = chunk["tokens"]
    header_tokens = set(chunk["header_tokens"])
    doc_len = len(chunk_tokens)

    if doc_len == 0:
        return 0.0

    for token in query_tokens:
        tf = chunk_tokens.count(token)
        if tf == 0:
            continue

        # Inverse Document Frequency (IDF)
        df = doc_freqs.get(token, 1)
        idf = math.log((total_chunks - df + 0.5) / (df + 0.5) + 1.0)

        # BM25 term score
        numerator = tf * (k1 + 1)
        denominator = tf + k1 * (1 - b + b * (doc_len / avg_dl))
        term_score = idf * (numerator / denominator)

        # Header match bonus (2x weight if keyword appears in title or section heading)
        if token in header_tokens:
            term_score *= 2.0

        score += term_score

    return score


def retrieve_documents(question: str, top_k: int = 4) -> List[Dict[str, Any]]:
    """
    Retrieve top K most relevant knowledge base chunks for a question.
    """
    query_tokens = tokenize(question)
    if not query_tokens:
        return []

    chunks = load_knowledge_chunks()
    total_chunks = len(chunks)
    if total_chunks == 0:
        return []

    # Calculate document frequencies
    doc_freqs: Dict[str, int] = {}
    total_tokens = 0
    for chunk in chunks:
        total_tokens += len(chunk["tokens"])
        unique_tokens = set(chunk["tokens"])
        for token in unique_tokens:
            doc_freqs[token] = doc_freqs.get(token, 0) + 1

    avg_dl = total_tokens / total_chunks if total_chunks > 0 else 1.0

    scored_chunks = []
    for chunk in chunks:
        score = calculate_bm25_score(query_tokens, chunk, total_chunks, doc_freqs, avg_dl)
        if score > 0.1:
            scored_chunks.append({
                "title": f"{chunk['title']} - {chunk['section_title']}",
                "doc_title": chunk['title'],
                "path": chunk['path'],
                "chunk_id": chunk['chunk_id'],
                "content": chunk['content'],
                "score": round(score, 3)
            })

    # Sort by BM25 score descending
    scored_chunks.sort(key=lambda item: item["score"], reverse=True)

    # De-duplicate contiguous chunks from same document if top_k spans many
    results = []
    seen_paths = set()
    for item in scored_chunks:
        if len(results) >= top_k:
            break
        results.append(item)

    return results