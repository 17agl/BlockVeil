function PrivacyCategoryRadar({ categoryScores = {} }) {
  const categories = [
    { key: "address_reuse", name: "Address Reuse Prevention", score: categoryScores.address_reuse ?? 100 },
    { key: "co_spending", name: "UTXO Co-Spending Isolation (CIOH)", score: categoryScores.co_spending ?? 100 },
    { key: "amount_patterns", name: "Payment Amount Privacy", score: categoryScores.amount_patterns ?? 100 },
    { key: "change_detection", name: "Change Output Obfuscation", score: categoryScores.change_detection ?? 100 },
    { key: "script_format", name: "Script Type Privacy (SegWit/Taproot)", score: categoryScores.script_format ?? 100 }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="category-radar-card">
      <div className="card-header">
        <p className="section-label">MULTI-CATEGORY RISK METRICS</p>
        <h2>Privacy Sub-Category Breakdown</h2>
        <p>Granular privacy performance ratings across five key Bitcoin protocol dimensions.</p>
      </div>

      <div className="categories-list">
        {categories.map((cat) => {
          const color = getScoreColor(cat.score);
          return (
            <div key={cat.key} className="category-row">
              <div className="cat-label-row">
                <span className="cat-name">{cat.name}</span>
                <span className="cat-score" style={{ color }}>
                  {cat.score}/100
                </span>
              </div>

              <div className="cat-track">
                <div
                  className="cat-fill"
                  style={{ width: `${cat.score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrivacyCategoryRadar;
