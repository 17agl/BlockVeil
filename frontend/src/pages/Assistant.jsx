import { useState } from "react";

import { askAssistant } from "../services/api";


function Assistant() {

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit = async (event) => {

    event.preventDefault();

    const cleanQuestion =
      question.trim();


    if (!cleanQuestion || loading) {
      return;
    }


    setError("");


    setMessages((previous) => [
      ...previous,

      {
        role: "user",
        content: cleanQuestion,
      },
    ]);


    setQuestion("");
    setLoading(true);


    try {

      const result =
        await askAssistant(
          cleanQuestion
        );


      setMessages((previous) => [
        ...previous,

        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
        },
      ]);

    } catch (error) {

      setError(
        error.message ||
        "Unable to get answer."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <main className="page">

      <div className="page-header">

        <p className="section-label">
          AI EDUCATION
        </p>

        <h1>
          Bitcoin / Nostr Assistant
        </h1>

        <p>
          Ask questions about Bitcoin and
          Nostr using the curated knowledge base.
        </p>

      </div>


      <div className="chat-card">

        <div className="messages">

          {messages.length === 0 && (

            <div className="chat-empty">

              <div className="chat-icon">
                ✦
              </div>

              <h2>
                Bitcoin Knowledge Assistant
              </h2>

              <p>
                Try asking:
                "What is a UTXO?"
                or
                "What is a Nostr relay?"
              </p>

            </div>

          )}


          {messages.map(
            (message, index) => (

              <div
                className={`message ${
                  message.role
                }`}
                key={index}
              >

                <div className="message-label">
                  {message.role === "user"
                    ? "You"
                    : "Assistant"}
                </div>

                <div className="message-content">
                  {message.content}
                </div>


                {message.sources &&
                  message.sources.length > 0 && (

                    <div className="message-sources">

                      <span>
                        Sources
                      </span>

                      {message.sources.map(
                        (source) => (

                          <div
                            className="source"
                            key={source.path}
                          >
                            📄 {source.path}
                          </div>

                        )
                      )}

                    </div>

                  )}

              </div>

            )
          )}


          {loading && (

            <div className="message assistant">

              <div className="message-label">
                Assistant
              </div>

              <div className="typing">
                Thinking...
              </div>

            </div>

          )}

        </div>


        {error && (

          <div className="chat-error">
            {error}
          </div>

        )}


        <form
          className="chat-input"
          onSubmit={handleSubmit}
        >

          <input
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            placeholder="Ask about Bitcoin or Nostr..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
          >
            {loading
              ? "..."
              : "Ask"}
          </button>

        </form>

      </div>

    </main>
  );
}


export default Assistant;