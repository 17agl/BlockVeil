function KnowledgeBase() {

  const topics = [
    "UTXO",
    "PSBT",
    "Bitcoin Transactions",
    "Address Reuse",
    "Change Outputs",
    "Bitcoin Fees",
    "Nostr Relay",
    "npub",
    "nsec",
    "Nostr Events",
    "Zaps",
  ];

  return (
    <main className="page">

      <div className="page-header">

        <p className="section-label">
          DOCUMENTATION
        </p>

        <h1>
          Knowledge Base
        </h1>

        <p>
          Curated reference material used by
          the Bitcoin/Nostr assistant.
        </p>

      </div>


      <div className="knowledge-grid">

        {topics.map((topic) => (

          <div
            className="knowledge-card"
            key={topic}
          >

            <span>📄</span>

            <div>
              <h3>{topic}</h3>
              <p>Reference document</p>
            </div>

          </div>

        ))}

      </div>

    </main>
  );
}

export default KnowledgeBase;