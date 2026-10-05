const knowledgeData = {

  bitcoin: {

    title: "Bitcoin Knowledge",

    description:
      "Learn the core Bitcoin concepts used by the Privacy Assistant.",

    topics: [

      {
        title: "UTXO",
        icon: "◈",
        description:
          "A UTXO is an unspent transaction output that can be used as an input in a future Bitcoin transaction."
      },

      {
        title: "PSBT",
        icon: "◇",
        description:
          "A Partially Signed Bitcoin Transaction is a format used to exchange a Bitcoin transaction that may require signatures."
      },

      {
        title: "Transaction",
        icon: "↔",
        description:
          "A Bitcoin transaction consumes inputs and creates outputs. The difference between total inputs and outputs generally represents the transaction fee."
      },

      {
        title: "Address Reuse",
        icon: "⚠",
        description:
          "Using the same receiving address multiple times can make transactions easier to associate."
      },

      {
        title: "Change Output",
        icon: "↩",
        description:
          "When a UTXO is spent, the unused portion can be returned to a change output. Identifying change is a heuristic and is not guaranteed."
      },

      {
        title: "Fees",
        icon: "₿",
        description:
          "Bitcoin transaction fees are generally calculated from the difference between input value and output value. Fee rates are commonly expressed in satoshis per virtual byte."
      }

    ]

  },


  nostr: {

    title: "Nostr Knowledge",

    description:
      "Learn the basic concepts behind the decentralized Nostr protocol.",

    topics: [

      {
        title: "Relay",
        icon: "◎",
        description:
          "A Nostr relay accepts, stores, and distributes events. Clients can connect to multiple independent relays."
      },

      {
        title: "npub",
        icon: "◉",
        description:
          "An npub is a human-readable Bech32 representation of a Nostr public key. It is a public identifier."
      },

      {
        title: "nsec",
        icon: "🔐",
        description:
          "An nsec represents a Nostr private key. It is secret and should never be shared with websites, AI systems, relays, or other people."
      },

      {
        title: "Event",
        icon: "✦",
        description:
          "A Nostr event is a signed data object containing information such as a public key, event content, and signature."
      },

      {
        title: "Zap",
        icon: "⚡",
        description:
          "A Nostr zap is a Lightning payment associated with a Nostr interaction. The exact experience depends on the client and supporting infrastructure."
      }

    ]

  }

};


function Knowledge({
  type
}) {

  const data =
    knowledgeData[type] ||
    knowledgeData.bitcoin;


  return (

    <main className="page">

      <div className="page-header">

        <p className="section-label">
          KNOWLEDGE BASE
        </p>

        <h1>
          {data.title}
        </h1>

        <p>
          {data.description}
        </p>

      </div>


      <div className="knowledge-grid">

        {data.topics.map(
          (topic) => (

            <article
              className="knowledge-card"
              key={topic.title}
            >

              <div className="knowledge-icon">
                {topic.icon}
              </div>

              <div>

                <h2>
                  {topic.title}
                </h2>

                <p>
                  {topic.description}
                </p>

              </div>

            </article>

          )
        )}

      </div>


      <div className="knowledge-note">

        <strong>
          Educational information
        </strong>

        <p>
          This knowledge section provides
          beginner-friendly explanations.
          The privacy analyzer uses a separate
          curated knowledge base when generating
          AI explanations.
        </p>

      </div>

    </main>
  );
}


export default Knowledge;