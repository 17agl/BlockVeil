function PrivacyScore({ score, rating, scoreBreakdown = [] }) {
  const getRatingColor = (ratingVal) => {
    if (ratingVal === "Excellent" || ratingVal === "Good") return "#10b981";
    if (ratingVal === "Needs Improvement") return "#f59e0b";
    return "#ef4444";
  };

  const ratingColor = getRatingColor(rating);

  return (
    <div className="score-card">
      <div className="score-header">
        <div>
          <p className="section-label">PRIVACY ASSESSMENT SCORE</p>
          <h2 style={{ color: ratingColor }}>{rating}</h2>
        </div>

        <div className="score-number-badge" style={{ borderColor: ratingColor, color: ratingColor }}>
          <span className="score-val">{score}</span>
          <span className="score-max">/100</span>
        </div>
      </div>

      <div className="score-bar">
        <div
          className="score-fill"
          style={{
            width: `${Math.max(0, Math.min(100, score))}%`,
            backgroundColor: ratingColor
          }}
        />
      </div>

      {scoreBreakdown && scoreBreakdown.length > 0 && (
        <div className="score-breakdown-box">
          <div className="breakdown-title">SCORE DEDUCTION BREAKDOWN</div>
          <div className="breakdown-list">
            {scoreBreakdown.map((item, idx) => (
              <div key={idx} className="breakdown-item">
                <span className="breakdown-points">-{item.points} pts</span>
                <span className="breakdown-title-text">{item.title}:</span>
                <span className="breakdown-reason">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="score-description">
        This privacy score is calculated empirically using rule-based heuristics on public blockchain data.
        It does not represent guaranteed or universal identity measurement.
      </p>
    </div>
  );
}

export default PrivacyScore;