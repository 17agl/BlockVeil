import { useState } from "react";

const knowledgeData = {
  bitcoin: {
    title: "Bitcoin Privacy & Protocol Knowledge Base",
    description: "In-depth technical guides explaining UTXOs, PSBTs, privacy heuristics, script formats, and CoinJoin protocols.",
    topics: [
      {
        id: "utxo",
        title: "UTXO (Unspent Transaction Output)",
        category: "Privacy & Security",
        icon: "◈",
        shortDesc: "Individual discrete chunks of Bitcoin that sit at specific addresses and are consumed as inputs when spending.",
        deepExplanation: "In Bitcoin, balances do not exist as a single combined account balance. Instead, a wallet's balance is the sum of discrete Unspent Transaction Outputs (UTXOs). When you send Bitcoin, your wallet selects one or more existing UTXOs, spends them entirely as inputs, creates a payment output for the recipient, and returns any remaining balance back to your wallet as a new change UTXO.",
        privacyImpact: [
          "Combining multiple small UTXOs into a single transaction triggers Multi-Input Co-Spending (CIOH), linking distinct address balances.",
          "UTXO size and non-round values can reveal change outputs to blockchain observers.",
          "Proper Coin Control allows users to select specific UTXOs manually to prevent unwanted identity clustering."
        ],
        protocolDetails: "Protocol Specs: UTXOs are identified by `txid:vout_index`. Consumed inputs require cryptographic signatures matching scriptpubkeys.",
        bestPractice: "Use manual Coin Control in privacy wallets (such as Sparrow or Electrum) to isolate sensitive UTXOs."
      },
      {
        id: "psbt",
        title: "PSBT (Partially Signed Bitcoin Transaction - BIP 174)",
        category: "Protocol & Scripts",
        icon: "◇",
        shortDesc: "Standardized format allowing unsigned or partially signed transactions to pass between hardware wallets and co-signers.",
        deepExplanation: "BIP 174 defines Partially Signed Bitcoin Transactions (PSBT). PSBTs allow multiple software wallets, hardware devices, and cold storage signers to construct, inspect, and sign a transaction sequentially without revealing private keys or broadcasting until all required signatures are gathered.",
        privacyImpact: [
          "Enables air-gapped signing over QR codes or SD cards, protecting private key exposure.",
          "Facilitates collaborative privacy protocols such as CoinJoin and PayJoin without trusting a central server.",
          "Multi-signature quorums (e.g. 2-of-3) can construct complex scripts offline."
        ],
        protocolDetails: "BIP Specification: BIP 174 / BIP 370 (PSBT v2). Extensible key-value maps carrying input witness metadata.",
        bestPractice: "Verify address destinations and amounts on your hardware wallet screen when reviewing PSBTs."
      },
      {
        id: "address-reuse",
        title: "Address Reuse & Privacy Vulnerability",
        category: "Privacy & Security",
        icon: "⚠",
        shortDesc: "Reusing the same receiving address multiple times links all associated payments to a single owner fingerprint.",
        deepExplanation: "Address reuse occurs when an address is used to receive funds more than once. Because all Bitcoin transactions are permanently recorded on a public blockchain, any external observer can easily associate every incoming payment to a reused address as belonging to the same entity.",
        privacyImpact: [
          "Links past and future payments, revealing your total accumulated balance to anyone who pays you.",
          "If one transaction is linked to a KYC exchange account, your entire transaction history becomes deanonymized.",
          "Allows automated chain analysis clustering algorithms to build comprehensive profile maps."
        ],
        protocolDetails: "Rule Penalty: Address reuse incurs up to -35 points on our heuristic privacy score engine.",
        bestPractice: "Always generate a fresh, unused receiving address for every single transaction."
      },
      {
        id: "co-spending",
        title: "Multi-Input Co-Spending (CIOH)",
        category: "Privacy & Security",
        icon: "🔗",
        shortDesc: "Common Input Ownership Heuristic (CIOH) assumes all inputs in a single multi-input transaction belong to one owner.",
        deepExplanation: "When a transaction requires more funds than a single UTXO provides, the wallet combines multiple UTXOs as inputs. Public blockchain analysis tools operate under the Common Input Ownership Heuristic (CIOH), assuming that a single wallet owner possesses all private keys for the combined inputs.",
        privacyImpact: [
          "Merges previously unassociated addresses into a single linked identity cluster.",
          "Exposes total wallet holdings across multiple addresses to blockchain surveillance.",
          "Can only be broken using collaborative transaction protocols like CoinJoin or PayJoin."
        ],
        protocolDetails: "Heuristic Confidence: High. Standard multi-input transactions cluster all input addresses into a single wallet node.",
        bestPractice: "Consolidate UTXOs carefully when fees are low or use CoinJoin to break input ownership links."
      },
      {
        id: "change-heuristics",
        title: "Change Output Identification Heuristics",
        category: "Privacy & Security",
        icon: "↩",
        shortDesc: "Methods used by chain observers to distinguish change outputs from intended payment outputs.",
        deepExplanation: "In a standard 2-output Bitcoin transaction, one output is the payment destination and the second is the change returned to the sender. Analysts identify change using several sub-heuristics: matching input address formats, pairing non-round values with round payments, or detecting script inheritance.",
        privacyImpact: [
          "Reveals which output is change, allowing observers to track the sender's remaining balance.",
          "Reusing input address formats for change makes change creation predictable.",
          "Identifies transaction directional flow across the blockchain graph."
        ],
        protocolDetails: "Sub-heuristics: Self-address reuse change, round payment pairing, and script-type inheritance.",
        bestPractice: "Configure wallet change outputs to use randomized sub-sat values or PayJoin (BIP 78)."
      },
      {
        id: "round-amounts",
        title: "Round Amount Payment Patterns",
        category: "Privacy & Security",
        icon: "🟠",
        shortDesc: "Distinctive payment amounts (e.g. 0.1 BTC or 1,000,000 sats) reduce transaction entropy.",
        deepExplanation: "Human senders frequently send round payment values (such as 0.10 BTC, 0.05 BTC, or 1,000,000 satoshis). When one output in a 2-output transaction is a round number and the other is a non-round decimal (e.g. 0.03481290 BTC), chain analysis software infers the round output as the payment destination and the non-round output as change.",
        privacyImpact: [
          "Eliminates output ambiguity in 2-output transactions.",
          "Assists automated clustering algorithms in identifying commercial payment destinations.",
          "Lowers privacy score due to recognizable payment fingerprints."
        ],
        protocolDetails: "Thresholds Analyzed: Multiples of 100k, 500k, 1M, 5M, 10M, 50M, 100M satoshis.",
        bestPractice: "Vary payment amounts slightly or use PayJoin to obscure exact payment values."
      },
      {
        id: "coinjoin",
        title: "CoinJoin & PayJoin Protocols",
        category: "Privacy & Security",
        icon: "🌀",
        shortDesc: "Trustless privacy-preserving protocols that combine transactions from multiple users into a single mixed structure.",
        deepExplanation: "CoinJoin is a collaborative transaction protocol where multiple independent participants mix their UTXOs together in a single transaction with identical output sizes (e.g. 0.05 BTC each). PayJoin (BIP 78) is a 2-party payment protocol where both merchant and customer contribute inputs to a transaction.",
        privacyImpact: [
          "Completely breaks the Common Input Ownership Heuristic (CIOH).",
          "Destroys deterministic transaction graph linkage.",
          "Provides mathematical anonymity sets for all participants."
        ],
        protocolDetails: "Implementations: Whirlpool (Samourai/Sparrow), JoinMarket, BIP 78 PayJoin.",
        bestPractice: "Execute CoinJoin mixing when managing significant UTXO sets requiring high privacy."
      },
      {
        id: "taproot",
        title: "Taproot (BIP 340 / 341 / 342)",
        category: "Protocol & Scripts",
        icon: "⚡",
        shortDesc: "Major soft-fork introducing Schnorr signatures and MAST to hide complex smart contract script branches.",
        deepExplanation: "Taproot (activated Nov 2021) introduces Schnorr Signatures (BIP 340) and Merklized Alternative Script Trees (MAST - BIP 341). Taproot allows complex multi-signature scripts, time-locks, and smart contracts to look identical on-chain to simple single-key transactions when spent via the key path.",
        privacyImpact: [
          "Makes multi-sig spending indistinguishable from single-key spending on the blockchain.",
          "Unexecuted smart contract script branches are never revealed publicly.",
          "Standardizes address outputs under `bc1p...` Bech32m encodings."
        ],
        protocolDetails: "Address Prefix: `bc1p` (Mainnet Bech32m). Uses 32-byte x-only public keys.",
        bestPractice: "Migrate wallets to Taproot (`bc1p`) for maximum smart contract privacy and fee efficiency."
      },
      {
        id: "segwit",
        title: "Native SegWit (Bech32 - BIP 173)",
        category: "Protocol & Scripts",
        icon: "▣",
        shortDesc: "Segregated Witness addresses that lower transaction size fees and eliminate script malleability.",
        deepExplanation: "Native SegWit (P2WPKH) separates cryptographic witness signatures from transaction block data. Native SegWit addresses start with `bc1q` and use Bech32 checksum encoding, resulting in significantly lower transaction byte sizes and cheaper miner fees compared to legacy P2PKH addresses.",
        privacyImpact: [
          "Smaller transaction weight reduces overall blockchain footprint.",
          "Bech32 encoding prevents human mistyping through built-in error detection.",
          "Uniform SegWit usage prevents script fingerprinting."
        ],
        protocolDetails: "Address Prefix: `bc1q` (Mainnet Bech32). Lower fee weight per virtual byte (vByte).",
        bestPractice: "Use Native SegWit (`bc1q`) as your default address standard for daily transactions."
      },
      {
        id: "fees-mempool",
        title: "Bitcoin Fees & Mempool Mechanics",
        category: "Layer 2 & Network",
        icon: "📊",
        shortDesc: "Fee market dynamics, satoshis per virtual byte (sat/vB), Replace-By-Fee (RBF), and mempool queuing.",
        deepExplanation: "Miners prioritize transactions based on fee density measured in satoshis per virtual byte (sat/vB). The mempool is the unconfirmed queue where broadcast transactions wait. Replace-By-Fee (RBF - BIP 125) allows senders to broadcast a replacement transaction with a higher fee to accelerate confirmation.",
        privacyImpact: [
          "RBF transactions update inputs/outputs while unconfirmed.",
          "Fee rate patterns can reveal wallet fee estimation algorithms to analysts.",
          "Extremely low fee change outputs (dust) can create recognizable transaction fingerprints."
        ],
        protocolDetails: "Unit: Satoshis per vByte (sat/vB). Virtual size (vsize) accounts for SegWit discount.",
        bestPractice: "Check live mempool fee rates before sending to select optimal sat/vB fee rates."
      },
      {
        id: "lightning",
        title: "Lightning Network (Layer 2 Off-Chain Privacy)",
        category: "Layer 2 & Network",
        icon: "⚡",
        shortDesc: "Layer 2 scaling network using payment channels and onion routing for instant, private off-chain micropayments.",
        deepExplanation: "The Lightning Network is a Layer 2 payment protocol operating over bidirectional payment channels. Individual Lightning payments do not touch the main Bitcoin blockchain. Nodes route payments using Sphinx onion encryption, where intermediate routing nodes only know their immediate predecessor and successor.",
        privacyImpact: [
          "Off-chain micropayments leave no public trace on the Bitcoin blockchain.",
          "Onion routing hides payment origin and final destination from intermediate nodes.",
          "Only channel funding (open) and channel closing transactions touch the mainnet ledger."
        ],
        protocolDetails: "Routing Protocol: Sphinx Onion Encryption. Invoices use BOLT-11 or BOLT-12 standards.",
        bestPractice: "Use Lightning for small, frequent daily purchases to preserve on-chain UTXO privacy."
      }
    ]
  },
  nostr: {
    title: "Nostr Decentralized Protocol Knowledge Base",
    description: "Learn how Nostr cryptographic keypairs, relays, signed events, and zaps enable censorship-resistant communication.",
    topics: [
      {
        id: "relays",
        title: "Relays & Protocol Architecture",
        category: "Protocol & Scripts",
        icon: "◎",
        shortDesc: "Decentralized WebSocket servers that accept, store, and distribute signed cryptographic events.",
        deepExplanation: "Nostr does not rely on a centralized server or a peer-to-peer blockchain consensus. Instead, clients connect to multiple independent WebSocket servers called Relays. Clients send signed events to relays and subscribe to filters. Because user identity is tied to cryptographic keypairs, users can freely switch relays without losing identity.",
        privacyImpact: [
          "Relays see IP addresses of connecting clients unless Tor or VPNs are used.",
          "Connecting to multiple relays ensures high availability and censorship resilience.",
          "Public relays store published notes permanently unless deletion events (Kind 5) are processed."
        ],
        protocolDetails: "Protocol: WebSockets (wss://). Event communication uses JSON-based NIP-01 specifications.",
        bestPractice: "Connect to reputable relays and use Tor or a trusted VPN to obscure IP addresses."
      },
      {
        id: "npub",
        title: "npub (Nostr Public Key)",
        category: "Privacy & Security",
        icon: "◉",
        shortDesc: "Human-readable Bech32 representation of a Nostr 32-byte public key identity.",
        deepExplanation: "An `npub` is the Bech32-encoded format of a Nostr public key starting with `npub1...`. It serves as your public identity fingerprint across the Nostr ecosystem, similar to a public username or wallet address. Anyone can view posts, profiles, and zaps associated with an `npub`.",
        privacyImpact: [
          "Safe to share publicly on social media, websites, or profile cards.",
          "Links all public notes, replies, and zaps posted under that keypair.",
          "Users can maintain separate `npub` identities for distinct personas."
        ],
        protocolDetails: "Specification: NIP-19 Bech32 encoding format for Nostr entities (`npub1...`).",
        bestPractice: "Share your `npub` freely to allow followers to locate your profile across relays."
      },
      {
        id: "nsec",
        title: "nsec (Nostr Private Key - Critical Security)",
        category: "Privacy & Security",
        icon: "🔐",
        shortDesc: "Secret 32-byte signing key. NEVER share, submit, or paste your nsec anywhere!",
        deepExplanation: "An `nsec` represents a Nostr private key encoded in Bech32 format starting with `nsec1...`. Your `nsec` grants complete control over your Nostr identity and allows cryptographic signing of notes, profile changes, and zaps. If anyone obtains your `nsec`, they own your identity permanently.",
        privacyImpact: [
          "CRITICAL SECURITY: Never share your `nsec` with websites, AI systems, relays, or other users.",
          "If compromised, your identity cannot be recovered or revoked; you must generate a new keypair.",
          "Use browser extension signers (such as nos2x, Alby, or Amber) so websites never touch raw `nsec` keys."
        ],
        protocolDetails: "Specification: NIP-19 Bech32 encoding format (`nsec1...`). 32-byte Secp256k1 private key.",
        bestPractice: "Store your `nsec` securely offline or use a browser extension signer (NIP-07)."
      },
      {
        id: "events",
        title: "Signed Events & NIP Kinds",
        category: "Protocol & Scripts",
        icon: "✦",
        shortDesc: "Immutable signed JSON data structures representing posts, metadata, reactions, and DMs.",
        deepExplanation: "Everything in Nostr is an Event (NIP-01). An event is a JSON object containing the author's public key, creation timestamp, integer `kind` (type of event), tags array, content string, and Schnorr signature. Event kinds dictate how clients display data (e.g. Kind 0 = Profile Metadata, Kind 1 = Text Note, Kind 4 = Encrypted DM).",
        privacyImpact: [
          "Every event is cryptographically signed and immutable.",
          "Encrypted DMs (Kind 4 / NIP-44) encrypt content string for the recipient's public key.",
          "Event metadata (timestamp, tags, pubkey) remains visible to relay operators."
        ],
        protocolDetails: "Signature: Secp256k1 Schnorr signature matching event ID hash.",
        bestPractice: "Use NIP-44 encrypted messaging for sensitive direct communication."
      },
      {
        id: "zaps",
        title: "Zaps (Lightning Value Transfer on Nostr)",
        category: "Layer 2 & Network",
        icon: "⚡",
        shortDesc: "Cryptographically verified Lightning Network payments attached to Nostr posts and profiles.",
        deepExplanation: "Zaps (NIP-57) combine Lightning Network payments with Nostr events. When a user zaps a note, their Lightning wallet pays a Lightning invoice (LNURL/Lightning Address) generated by the recipient's node. The Lightning provider broadcasts a Kind 9735 Zap Receipt event back to Nostr relays.",
        privacyImpact: [
          "Public zaps create on-chain/LNURL links between sender npub, recipient npub, and sat amounts.",
          "Anonymous zaps (NIP-57) allow users to send sat payments without attaching their sender `npub`.",
          "LNURL providers can log IP addresses requesting payment invoices."
        ],
        protocolDetails: "Specification: NIP-57 Zap Requests (Kind 9734) and Zap Receipts (Kind 9735).",
        bestPractice: "Use anonymous zaps when sending sats if you prefer not to broadcast public sender links."
      }
    ]
  }
};

function Knowledge({ type }) {
  const data = knowledgeData[type] || knowledgeData.bitcoin;

  const [expandedTopic, setExpandedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Privacy & Security", "Protocol & Scripts", "Layer 2 & Network"];

  const toggleExpand = (id) => {
    setExpandedTopic(expandedTopic === id ? null : id);
  };

  const filteredTopics = data.topics.filter((t) => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.deepExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="page">
      <div className="page-header">
        <p className="section-label">INTERACTIVE KNOWLEDGE HUB</p>
        <h1>{data.title}</h1>
        <p>{data.description} Click on any concept card below to expand in-depth technical guides, privacy impacts, and protocol specs.</p>
      </div>

      <div className="knowledge-controls">
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="knowledge-search-input"
            placeholder={`Search ${type === "nostr" ? "Nostr" : "Bitcoin"} concepts, keywords, or specs...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="knowledge-grid expanded-grid">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopic === topic.id;

          return (
            <article
              className={`knowledge-card interactive-card ${isExpanded ? "expanded" : ""}`}
              key={topic.id}
              onClick={() => toggleExpand(topic.id)}
            >
              <div className="card-top-row">
                <div className="knowledge-icon">{topic.icon}</div>
                <div className="card-heading-group">
                  <div className="topic-category-badge">{topic.category}</div>
                  <h2>{topic.title}</h2>
                </div>
                <span className="expand-indicator-chevron">{isExpanded ? "▲" : "▼"}</span>
              </div>

              <p className="topic-short-desc">{topic.shortDesc}</p>

              {isExpanded && (
                <div className="expanded-knowledge-body" onClick={(e) => e.stopPropagation()}>
                  <div className="knowledge-section-block">
                    <h3>📖 Detailed Technical Breakdown</h3>
                    <p>{topic.deepExplanation}</p>
                  </div>

                  <div className="knowledge-section-block">
                    <h3>🛡️ On-Chain Privacy & Security Impact</h3>
                    <ul className="impact-bullet-list">
                      {topic.privacyImpact.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="knowledge-section-block spec-block">
                    <code>{topic.protocolDetails}</code>
                  </div>

                  <div className="knowledge-section-block tip-block">
                    <strong>💡 Best Practice Recommendation:</strong>
                    <p>{topic.bestPractice}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="no-topics-found">
            <span>🔍</span>
            <h3>No matching concepts found</h3>
            <p>Try searching for a different keyword or select "All" categories.</p>
          </div>
        )}
      </div>

      <div className="knowledge-note">
        <strong>🛡️ Grounded Educational Disclaimer</strong>
        <p>
          This knowledge hub provides technical guides and protocol specifications.
          Our Privacy Analyzer retrieves these exact grounded markdown files to generate AI privacy explanations.
        </p>
      </div>
    </main>
  );
}

export default Knowledge;