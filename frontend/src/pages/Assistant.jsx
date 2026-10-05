import { useState, useEffect, useRef } from "react";
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

function getRecommendedFollowUpQuestions(content = "", activeReport = null) {
  const c = content.toLowerCase();

  if (c.includes("score") || c.includes("report") || c.includes("address")) {
    return [
      "Why was my privacy score deducted?",
      "Which transaction in my history is riskiest?",
      "How can I improve my privacy score?"
    ];
  }
  if (c.includes("utxo")) {
    return [
      "What is Multi-Input Co-Spending (CIOH)?",
      "How do I practice Coin Control in wallets?",
      "How do transaction fees affect UTXOs?"
    ];
  }
  if (c.includes("psbt")) {
    return [
      "How do hardware wallets sign PSBTs?",
      "What is CoinJoin vs PayJoin?",
      "How to use multi-sig with PSBT?"
    ];
  }
  if (c.includes("reuse")) {
    return [
      "How do HD wallets generate new addresses?",
      "What is the penalty for address reuse?",
      "How do I avoid address reuse in daily payments?"
    ];
  }
  if (c.includes("nostr") || c.includes("npub") || c.includes("nsec")) {
    return [
      "Why should I never share my nsec key?",
      "What are Nostr relays and how do they store notes?",
      "How do Nostr zaps work over Lightning?"
    ];
  }
  if (c.includes("coinjoin") || c.includes("payjoin") || c.includes("mix")) {
    return [
      "What is Whirlpool CoinJoin?",
      "How does PayJoin (BIP 78) break change analysis?",
      "How much does CoinJoin mixing cost?"
    ];
  }

  return [
    "What is a UTXO?",
    "How does address reuse affect privacy?",
    "What is Taproot (P2TR)?"
  ];
}

function Assistant({ activeReport }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (err) => {
        setIsListening(false);
        setError(`Voice recognition note: ${err.error || "Speech input ended."}`);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      setError("Speech recognition is not supported in this browser environment. Please type your query.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setError("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

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
    <main className="page assistant-page-compact">
      {/* Primary Focus: Chat Card Focused at Top */}
      <div className="chat-card top-focused-chat">
        <div className="compact-header-bar">
          <div className="header-left">
            <span className="ai-status-pulse">● LIVE AI ASSISTANT</span>
            <h2>Bitcoin / Nostr Grounded AI</h2>
          </div>

          {activeReport && (
            <div className="active-report-tag">
              <span>🔗 Active Address:</span>
              <code>{activeReport.address.slice(0, 10)}...</code>
              <span className="tag-score">{activeReport.score}/100</span>
            </div>
          )}
        </div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="chat-welcome-section">
              <div className="chat-empty">
                <div className="chat-icon">✦</div>
                <h2>Ask Any Question & Receive Grounded Guidance</h2>
                <p>Type below, click a suggested topic, or tap the microphone icon to speak your request.</p>
              </div>

              {activeReport && (
                <div className="suggested-category">
                  <div className="category-title">🔍 ACTIVE ADDRESS DIAGNOSTICS</div>
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

              {/* Recommended Next Questions After Assistant Response */}
              {message.role === "assistant" && (
                <div className="followup-questions-section">
                  <div className="followup-title">💡 RECOMMENDED NEXT QUESTIONS:</div>
                  <div className="followup-chips-row">
                    {getRecommendedFollowUpQuestions(message.content, activeReport).map((fq, idx) => (
                      <button
                        key={idx}
                        className="followup-chip"
                        onClick={() => handleChipClick(fq)}
                        disabled={loading}
                      >
                        ➔ {fq}
                      </button>
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
                <span className="typing-dot">.</span> Searching knowledge base and processing your query...
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

        <form className="chat-input voice-enhanced-input" onSubmit={handleSubmit}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={isListening ? "Listening... Speak your query now..." : "Ask any question about Bitcoin, UTXOs, PSBTs, or Nostr..."}
            disabled={loading}
          />

          <button
            type="button"
            className={`mic-button ${isListening ? "listening" : ""}`}
            onClick={toggleListening}
            title={isListening ? "Listening... Click to stop" : "Click to speak query"}
            disabled={loading}
          >
            {isListening ? "🔴" : "🎙️"}
          </button>

          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? "..." : "Ask Assistant"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Assistant;