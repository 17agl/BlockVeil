# BlockVeil
(₿ Bitcoin Privacy Assistant)

> An AI-powered Bitcoin privacy analysis suite, RAG educational assistant, and interactive transaction visualizer built for Bitcoiners and Nostr users.

---

## 📌 1. Project Overview & Problem Statement

Bitcoin transaction data is recorded permanently on a public, transparent blockchain ledger. Without privacy-conscious wallet practices, users expose their transaction history and financial balance to public chain analysis:
- **Address Reuse**: Reusing receiving addresses links distinct payments together on-chain.
- **Multi-Input Co-Spending (CIOH)**: Combining UTXOs from multiple addresses in a single transaction clusters all input addresses under a single owner identity.
- **Round-Number Payments**: Distinctive payment values (e.g. 0.1 BTC) allow heuristic algorithms to easily distinguish payment outputs from change outputs.
- **Recognizable Change Outputs**: Standard change creation patterns expose wallet balances.

**Bitcoin Privacy Assistant** addresses these issues by offering automated heuristic analysis, interactive visualization tools, What-If decision simulation, and grounded AI explanations.

---

## 🚀 2. Features

- **🔍 Advanced Bitcoin Privacy Checker**:
  - Address reuse detection & evidence gathering.
  - Multi-Input Co-Spending (CIOH) clustering.
  - Round payment recognition (decimal BTC & satoshi thresholds).
  - Multi-indicator change output heuristics (address reuse, script-type matching, non-round change pairing).
- **📈 Historical Privacy Score Timeline**: Visual step chart tracking privacy score changes transaction by transaction.
- **🔗 Address Relationship Graph**: Interactive node-and-edge graph mapping co-spent addresses, recipient destinations, and candidate change outputs.
- **🧪 Privacy "What-If" Simulator**: Real-time simulation showing estimated score gains from avoiding address reuse, co-spending, or executing CoinJoin.
- **📊 Multi-Category Risk Radar**: 0-100 score breakdown across 5 core dimensions.
- **🛡️ Actionable Privacy Guidance**: Prioritized recommendation badges (🔴 High Priority, 🟠 Medium Priority, 🟢 Good Practice).
- **🌐 Mempool & Bitcoin Network Widget**: Real-time block height, unconfirmed mempool count, and recommended sat/vB fee rates.
- **🤖 Grounded AI Education Assistant (RAG)**: BM25/TF-IDF chunk retriever providing grounded explanations with source citations.
- **📋 Report Exporter**: One-click copying and downloadable Markdown report (`.md`).
- **🔐 Defensive Input Security**: Rejects seed phrases, private keys (WIF/Hex), and Nostr `nsec` keys automatically.

---

## 🏗️ 3. Architecture Diagram

```text
                               ┌──────────────────┐
                               │  React Frontend  │
                               └────────┬─────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ↓                               ↓                               ↓
   Dashboard                     Privacy Checker                   AI Assistant
        │                               │                               │
        ↓                               ↓                               ↓
 Network Widget                  FastAPI Backend                 BM25 Retriever
                                        │                               │
                               ┌────────┴────────┐                      │
                               ↓                 ↓                      ↓
                         Mempool.space    Privacy Engine          Markdown Docs
                               │                 │                      │
                               ↓                 ↓                      ↓
                          Blockchain       Score, Timeline,        OpenAI API
                             Data          Graph & Evidence             │
                               │                 │                      │
                               └────────┬────────┘                      │
                                        ↓                               │
                                  Report Data ──────────────────────────┘
                                        │
                                        ↓
                                AI Report & Chat
```

---

## 🔄 4. System Sequence Diagram

```text
User                  React UI               FastAPI               Mempool API         Privacy Engine           RAG / OpenAI
 │                       │                      │                       │                    │                        │
 │── 1. Enter Address ──>│                      │                       │                    │                        │
 │                       │── 2. POST /analyze ─>│                       │                    │                        │
 │                       │                      │── 3. Validate Addr ──>│                    │                        │
 │                       │                      │── 4. Fetch TXs ──────>│                    │                        │
 │                       │                      │<── 5. Raw TX History ─│                    │                        │
 │                       │                      │                       │── 6. Run Rules ───>│                        │
 │                       │                      │                       │<── 7. Report Data ─│                        │
 │                       │<── 8. JSON Report ───│                       │                    │                        │
 │                       │                      │                       │                    │                        │
 │<── 9. Render Graph, ──│                      │                       │                    │                        │
 │    Score & Timeline   │                      │                       │                    │                        │
 │                       │                      │                       │                    │                        │
 │── 10. Click AI ─────>│                      │                       │                    │                        │
 │    Explanation        │── 11. POST /chat ───>│                       │                    │                        │
 │                       │   (with Report)      │                       │                    │── 12. BM25 Retrieve ──>│
 │                       │                      │                       │                    │<── 13. Top Docs ───────│
 │                       │                      │                       │                    │── 14. Prompt OpenAI ──>│
 │                       │                      │                       │                    │<── 15. Answer text ────│
 │<── 16. Display ───────│<── 17. Grounded ─────│                       │                    │                        │
 │    AI Response        │    Answer & Sources  │                       │                    │                        │
```

---

## 🛠️ 5. Tech Stack

- **Frontend**: React, Vite, JavaScript, CSS (Custom Glassmorphism Dark Theme)
- **Backend**: Python 3.14, FastAPI, Pytest, Pydantic, HTTPX, Starlette
- **Blockchain Data**: Mempool.space API
- **AI / RAG**: BM25 / TF-IDF Section Chunk Retriever, OpenAI GPT-4o-mini (with grounded fallback responder)

---

## 🌐 6. API Documentation

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/privacy/network-status` | Live block height, fees, and mempool backlog |
| `POST` | `/api/privacy/analyze` | Analyzes Bitcoin address transaction patterns |
| `POST` | `/api/privacy/explain` | Generates AI explanation of an analysis report |
| `POST` | `/api/chat` | Context-aware AI chat assistant |
| `GET` | `/api/transactions/{txid}` | Fetches transaction details |

---

## 📦 7. Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
OPENAI_API_KEY=your_openai_api_key_here
MEMPOOL_API_URL=https://mempool.space/api
OPENAI_MODEL=gpt-4o-mini
```

Run FastAPI Backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Application will be available at `http://localhost:5173`.

---

## 🧪 8. Automated Unit & API Testing

```bash
cd backend
$env:PYTHONPATH="."
python -m pytest tests/
```
Runs 17 comprehensive unit & API endpoint integration tests.

---

## ⚖️ 9. Academic & Technical Limitations Disclosure

1. **Heuristic Assessment**: All privacy scores and findings are rule-based **probabilistic heuristics**. They observe publicly recorded metadata on the Bitcoin blockchain and **do not prove identity, legal ownership, or personal intent**.
2. **Application-Specific Indicator**: The 0-100 privacy score is an application-specific educational metric rather than a universal or standardized Bitcoin privacy measurement.
3. **Change Detection**: Change output identification relies on heuristic indicators (address reuse, script matching, non-round output pairing) and is probabilistic.
