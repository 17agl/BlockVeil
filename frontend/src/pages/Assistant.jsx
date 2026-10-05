import { useState } from "react";
import { askAssistant } from "../services/api";

const ANALYSIS_QUESTIONS = [
  "Why is my privacy score low?",
  "Which transaction in my history is riskiest?",
  "How can I fix address reuse?"
];

const BITCOIN_QUESTIONS = [
  "What is a UTXO?",
  "Explain PSBT and how it works",
  "What is CoinJoin vs PayJoin?",
  "What is Taproot (P2TR)?"
];

const NOSTR_QUESTIONS = [
  "What is a Nostr relay?",
  "What is the difference between npub and nsec?",
  "How do Nostr zaps work?"
];

function Assistant({ activeReport }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitQuestion = async (qText) => {
    const cleanQuestion = qText.trim();
    if (!cleanQuestion || loading) return;

    setError("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: cleanQuestion }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const result = await askAssistant(cleanQuestion, activeReport);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources
        }
      ]);
    } catch (err) {
      setError(err.message || "Unable to retrieve response.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuestion(question);
  };

  const handleChipClick = (qText) => {
    submitQuestion(qText);
  };

  return (
    <main className="page">
      <div className="page-header">
        <p className="section-label">AI EDUCATION & ANALYSIS</p>
        <h1>Bitcoin / Nostr AI Assistant</h1>
        <p>
          Ask any question about Bitcoin transactions, privacy heuristics, UTXOs, PSBTs, or Nostr protocols.
        </p>
      </div>

      <div className="chat-card">
        {activeReport && (
          <div className="active-report-banner">
            <span>🔗 Active Analysis Context Loaded:</span>
            <code>{activeReport.address}</code>
            <span className="banner-score">Score: {activeReport.score}/100 ({activeReport.rating})</span>
          </div>
        )}

        {messages.length === 0 && (
          <div className="chat-welcome-section">
            <div className="chat-empty">
              <div className="chat-icon">✦</div>
              <h2>Grounded AI Knowledge & Diagnostic Assistant</h2>
              <p>Ask any custom question below or click a suggested prompt to explore:</p>
            </div>

            {activeReport && (
              <div className="suggested-category">
                <div className="category-title">🔍 ACTIVE ANALYSIS PROMPTS</div>
                <div className="suggested-questions-grid">
                  {ANALYSIS_QUESTIONS.map((sq, idx) => (
                    <button
                      key={idx}
                      className="suggested-chip analysis"
                      onClick={() => handleChipClick(sq)}
                      disabled={loading}
                    >
                      ⚡ {sq}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="suggested-category">
              <div className="category-title">₿ BITCOIN & PRIVACY CONCEPTS</div>
              <div className="suggested-questions-grid">
                {BITCOIN_QUESTIONS.map((sq, idx) => (
                  <button
                    key={idx}
                    className="suggested-chip"
                    onClick={() => handleChipClick(sq)}
                    disabled={loading}
                  >
                    💡 {sq}
                  </button>
                ))}
              </div>
            </div>

            <div className="suggested-category">
              <div className="category-title">🟣 NOSTR PROTOCOL CONCEPTS</div>
              <div className="suggested-questions-grid">
                {NOSTR_QUESTIONS.map((sq, idx) => (
                  <button
                    key={idx}
                    className="suggested-chip nostr"
                    onClick={() => handleChipClick(sq)}
                    disabled={loading}
                  >
                    ⚡ {sq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="messages">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={index}>
              <div className="message-label">
                {message.role === "user" ? "You" : "🤖 Assistant"}
              </div>

              <div className="message-content" style={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </div>

              {message.sources && message.sources.length > 0 && (
                <div className="message-sources">
                  <span>GROUNDED KNOWLEDGE SOURCES:</span>
                  <div className="sources-chips">
                    {message.sources.map((source) => (
                      <div className="source-chip" key={source.path}>
                        📄 {source.title || source.path} (Score: {source.score})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-label">🤖 Assistant</div>
              <div className="typing">
                <span className="typing-dot">.</span> Processing query against knowledge base and blockchain context...
              </div>
            </div>
          )}
        </div>

        {error && <div className="chat-error">{error}</div>}

        {messages.length > 0 && (
          <div className="mini-chips-bar">
            {[...ANALYSIS_QUESTIONS, ...BITCOIN_QUESTIONS].map((sq, idx) => (
              <button
                key={idx}
                className="mini-chip"
                onClick={() => handleChipClick(sq)}
                disabled={loading}
              >
                + {sq}
              </button>
            ))}
          </div>
        )}

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any question about Bitcoin, privacy heuristics, UTXOs, PSBTs, or Nostr..."
            disabled={loading}
          />

          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? "..." : "Ask Assistant"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Assistant;