function Dashboard({ setActivePage }) {

  return (
    <main className="page">

      <div className="hero">

        <div className="hero-content">

          <span className="hero-badge">
            ₿ BITCOIN PRIVACY TOOL
          </span>

          <h1>
            Understand what your
            <span> Bitcoin address reveals.</span>
          </h1>

          <p>
            Analyze public blockchain activity,
            identify common privacy patterns,
            and learn Bitcoin and Nostr concepts
            with an AI-powered assistant.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setActivePage("privacy")
            }
          >
            Check an Address →
          </button>

        </div>

        <div className="hero-symbol">
          ₿
        </div>

      </div>


      <section className="feature-grid">

        <div className="feature-card">

          <div className="feature-icon">
            ◉
          </div>

          <h3>
            Privacy Analysis
          </h3>

          <p>
            Detect address reuse, round-number
            payments, and possible change patterns.
          </p>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            ✦
          </div>

          <h3>
            AI Assistant
          </h3>

          <p>
            Ask questions about Bitcoin and Nostr
            using a curated knowledge base.
          </p>

        </div>


        <div className="feature-card">

          <div className="feature-icon">
            ▤
          </div>

          <h3>
            Explainable Results
          </h3>

          <p>
            Understand why a pattern was detected
            instead of receiving a mysterious score.
          </p>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;