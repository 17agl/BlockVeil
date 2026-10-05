import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

try:
    from openai import OpenAI
    if api_key and not api_key.startswith("your_"):
        client = OpenAI(api_key=api_key)
    else:
        client = None
except Exception:
    client = None

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

from .prompts import SYSTEM_PROMPT, PRIVACY_EXPLANATION_PROMPT


def build_context(documents: List[Dict[str, Any]]) -> str:
    if not documents:
        return "No relevant knowledge-base documents were found."

    context_parts = []
    for doc in documents:
        context_parts.append(
            f"SOURCE: {doc.get('path')} ({doc.get('title')})\n\n{doc.get('content')}"
        )

    return "\n\n---\n\n".join(context_parts)


def fallback_generate_answer(question: str, documents: List[Dict[str, Any]], active_report: Optional[Dict[str, Any]] = None) -> str:
    """
    Intelligent fallback response engine providing accurate, clean, and comprehensive answers
    for any query on Bitcoin, Nostr, or active privacy reports.
    """
    q_lower = question.lower().strip()

    # 1. Active Report Query Handling
    if active_report and any(w in q_lower for w in ["score", "why", "my address", "deduction", "risky", "improve", "report", "analysis"]):
        address = active_report.get("address", "Unknown")
        score = active_report.get("score", 100)
        rating = active_report.get("rating", "Unknown")
        flags = [f for f in active_report.get("flags", []) if f.get("detected")]
        breakdown = active_report.get("score_breakdown", [])
        recs = active_report.get("recommendations", [])

        lines = [
            f"### Active Privacy Diagnostic Report for `{address[:10]}...{address[-6:]}`",
            f"**Overall Privacy Score:** {score}/100 ({rating})",
            "",
            "#### Summary of Analysis:"
        ]

        if breakdown:
            lines.append("#### Score Deduction Breakdown:")
            for b in breakdown:
                lines.append(f"- **-{b['points']} pts** (`{b['title']}`): {b['reason']}")
            lines.append("")

        if flags:
            lines.append("#### Detected Privacy Vulnerabilities & Evidence:")
            for f in flags:
                lines.append(f"- **{f['title']}** (Severity: {f['severity'].upper()}, Confidence: {f['confidence'].upper()})")
                lines.append(f"  *Summary:* {f['message']}")
                if f.get("why_detected"):
                    lines.append(f"  *Evidence:* {f['why_detected'][0]}")
            lines.append("")

        if recs:
            lines.append("#### Recommended Action Items:")
            for r in recs:
                lines.append(f"- **[{r['badge']}] {r['title']}**: {r['description']}")
            lines.append("")

        lines.append("> 💡 *Tip:* Ask follow-up questions like 'What is CoinJoin?' or 'How does multi-input co-spending work?' for deeper details.")
        return "\n".join(lines)

    # 2. Specific RAG document matches
    if documents:
        top_doc = documents[0]
        content_clean = top_doc.get("content", "").strip()

        # Format cleanly without raw headings duplicating
        return f"{content_clean}"

    # 3. Topic specific knowledge fallbacks
    if "utxo" in q_lower:
        return (
            "### What is a UTXO (Unspent Transaction Output)?\n\n"
            "A **UTXO (Unspent Transaction Output)** is an unspent chunk of Bitcoin sitting at a specific address, "
            "ready to be spent in a future transaction. Think of UTXOs like physical cash coins or bills in a digital wallet.\n\n"
            "#### How UTXOs Work:\n"
            "- When someone sends you 0.5 BTC, a **0.5 BTC UTXO** is created under your address.\n"
            "- When you want to pay 0.2 BTC, your wallet consumes the entire 0.5 BTC UTXO as an input, pays 0.2 BTC to the recipient, "
            "and creates a new **0.3 BTC change UTXO** sent back to your wallet (minus network transaction fees).\n\n"
            "#### Why UTXOs Matter for Privacy:\n"
            "Combining multiple small UTXOs into one transaction triggers **Multi-Input Co-Spending (CIOH)**, "
            "revealing to public blockchain observers that all input addresses belong to the same wallet entity."
        )

    if "psbt" in q_lower:
        return (
            "### What is a PSBT (Partially Signed Bitcoin Transaction)?\n\n"
            "**PSBT (BIP 174)** is a standardized format that allows unsigned or partially signed Bitcoin transactions "
            "to be passed between hardware wallets, air-gapped devices, and multi-signature co-signers before being broadcast.\n\n"
            "#### Key Benefits of PSBTs:\n"
            "- **Hardware Wallet Security**: Air-gapped cold storage devices can verify and sign transaction details offline via QR codes or SD cards.\n"
            "- **Multi-Sig Workflows**: Enables multi-signature wallets (e.g. 2-of-3) to collect signatures sequentially from different devices.\n"
            "- **CoinJoin & PayJoin Integration**: Facilitates collaborative multi-party transactions without exposing private keys."
        )

    if "nostr" in q_lower or "npub" in q_lower or "nsec" in q_lower or "relay" in q_lower or "zap" in q_lower:
        return (
            "### Nostr Protocol Essentials\n\n"
            "**Nostr** (Notes and Other Stuff Transmitted by Relays) is an open, censorship-resistant decentralized protocol "
            "for social networking and value transfer using cryptographic keypairs.\n\n"
            "#### Core Nostr Concepts:\n"
            "- **`npub` (Public Key)**: Your public identity fingerprint (safe to share publicly, like a username).\n"
            "- **`nsec` (Private Key)**: Your secret signing key. **NEVER share your `nsec` with anyone!**\n"
            "- **Relays**: Decentralized servers that store and forward event notes between clients.\n"
            "- **Zaps**: Lightning Network payments linked directly to Nostr posts and profiles."
        )

    if "coinjoin" in q_lower or "payjoin" in q_lower or "mix" in q_lower:
        return (
            "### CoinJoin and PayJoin Privacy Protocols\n\n"
            "**CoinJoin** is a privacy protocol where multiple independent users combine their transaction inputs and outputs into a single large transaction.\n\n"
            "#### Why CoinJoin Protects Privacy:\n"
            "- Creates identical equal-sized outputs (e.g. 0.1 BTC each) for many users.\n"
            "- Destroys the assumption that multi-input transactions belong to a single entity.\n"
            "- Makes it mathematically impossible for external chain observers to trace which input paid which output."
        )

    if "fee" in q_lower or "sats/vb" in q_lower or "mempool" in q_lower:
        return (
            "### Bitcoin Fees and Mempool Mechanics\n\n"
            "Bitcoin transactions require network fees paid to miners for inclusion in a block.\n\n"
            "#### Key Concepts:\n"
            "- **Sats per vByte (sat/vB)**: The rate of fee paid per virtual byte of transaction size.\n"
            "- **Mempool**: The queue of unconfirmed transactions waiting to be included in a block.\n"
            "- **Replace-By-Fee (RBF)**: Allows senders to boost the fee of an unconfirmed transaction to speed up confirmation."
        )

    # 4. General fallback answer for any open query
    return (
        f"### Bitcoin Privacy & Technical Overview\n\n"
        f"Regarding your query **'{question}'**:\n\n"
        "Bitcoin is an open public ledger where transaction inputs and outputs are recorded permanently. "
        "To maintain optimal financial privacy and security:\n\n"
        "1. **Never Reuse Addresses**: Generate a fresh receiving address for every incoming transaction.\n"
        "2. **Practice Coin Control**: Select UTXOs deliberately to avoid combining unrelated address balances.\n"
        "3. **Use Modern Address Formats**: Prefer Native SegWit (`bc1q`) or Taproot (`bc1p`) for lower fees and superior privacy.\n\n"
        "Feel free to ask specific questions about UTXOs, PSBTs, Nostr relays, or your active privacy analysis score!"
    )


def fallback_generate_privacy_explanation(report: Dict[str, Any]) -> str:
    """Fallback privacy explanation when OpenAI API key is unavailable."""
    score = report.get("score", 100)
    rating = report.get("rating", "Unknown")
    address = report.get("address", "Unknown")
    flags = report.get("flags", [])
    breakdown = report.get("score_breakdown", [])

    detected_flags = [f for f in flags if f.get("detected")]

    lines = [
        f"### Privacy Assessment for Address: `{address}`",
        f"**Privacy Score:** {score}/100 ({rating})",
        "",
        "#### Overview of Findings",
        f"The privacy score is **{score}/100**, placing this address in the **{rating}** category.",
        ""
    ]

    if breakdown:
        lines.append("#### Score Deduction Breakdown:")
        for item in breakdown:
            lines.append(f"- **-{item['points']} points** ({item['title']}): {item['reason']}")
        lines.append("")

    if detected_flags:
        lines.append("#### Detected Privacy Signals & Evidence:")
        for flag in detected_flags:
            lines.append(f"##### 🔴 {flag.get('title')} (Severity: {flag.get('severity').upper()}, Confidence: {flag.get('confidence').upper()})")
            lines.append(f"*{flag.get('message')}*")
            if flag.get("why_detected"):
                lines.append("\n**Why was this detected?**")
                for reason in flag.get("why_detected"):
                    lines.append(f"- {reason}")
            if flag.get("mitigation"):
                lines.append(f"\n💡 **Recommendation:** {flag.get('mitigation')}\n")
    else:
        lines.append("🟢 **No configured privacy vulnerability signals were detected.**")
        lines.append("The address has not triggered receiving address reuse, co-spending, or round payment heuristics.")

    lines.append("")
    lines.append("> ⚠️ **Disclaimer:** All privacy findings are heuristic indicators based on public blockchain data. They do not prove legal identity or wallet ownership.")

    return "\n".join(lines)


def generate_answer(question: str, documents: List[Dict[str, Any]], active_report: Optional[Dict[str, Any]] = None) -> str:
    """
    Generate answer for Bitcoin/Nostr educational assistant using OpenAI API or fallback.
    Can incorporate active privacy analysis report context.
    Never prepends error messages to response text.
    """
    if client is None:
        return fallback_generate_answer(question, documents, active_report)

    context = build_context(documents)

    report_context = ""
    if active_report:
        report_context = f"""ACTIVE USER PRIVACY REPORT
==========================
Address: {active_report.get('address')}
Privacy Score: {active_report.get('score')} / 100 ({active_report.get('rating')})
Score Deductions: {active_report.get('score_breakdown')}
Detected Flags: {[f.get('title') for f in active_report.get('flags', []) if f.get('detected')]}
"""

    user_prompt = f"""KNOWLEDGE BASE CONTEXT
======================
{context}

{report_context}

USER QUESTION
=============
{question}

Answer the user's question directly, clearly, and concisely using the supplied context and active report details if relevant. Do not include meta-comments or error prefixes.
"""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception:
        # Silently fall back to clean answer generator without prepending error prefixes
        return fallback_generate_answer(question, documents, active_report)


def generate_privacy_explanation(report: Dict[str, Any], documents: List[Dict[str, Any]]) -> str:
    """
    Generate an AI explanation of a privacy analysis report.
    Never prepends error messages to response text.
    """
    if client is None:
        return fallback_generate_privacy_explanation(report)

    context = build_context(documents)

    flags_text = ""
    for flag in report.get("flags", []):
        if flag.get("detected"):
            why_list = "\n  - ".join(flag.get("why_detected", []))
            flags_text += f"""
Rule: {flag.get("title")} ({flag.get("rule")})
Severity: {flag.get("severity")}
Confidence: {flag.get("confidence")}
Summary: {flag.get("message")}
Why Detected / Evidence:
  - {why_list}
Mitigation: {flag.get("mitigation")}
"""

    breakdown_text = ""
    for b in report.get("score_breakdown", []):
        breakdown_text += f"- {b['title']}: -{b['points']} points ({b['reason']})\n"

    user_prompt = f"""KNOWLEDGE BASE CONTEXT
======================
{context}

PRIVACY ANALYSIS REPORT
=======================
Address: {report.get("address")}
Transaction Count: {report.get("transaction_count")}
Privacy Score: {report.get("score")} / 100 ({report.get("rating")})

Score Deductions:
{breakdown_text or 'None'}

Detected Privacy Flags:
{flags_text or 'None (All clean)'}

======================
TASK
====
{PRIVACY_EXPLANATION_PROMPT}
"""
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception:
        # Silently fall back to clean explanation generator without prepending error prefixes
        return fallback_generate_privacy_explanation(report)