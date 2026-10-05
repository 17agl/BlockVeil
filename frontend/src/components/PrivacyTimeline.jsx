function PrivacyTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="timeline-card">
      <div className="card-header">
        <p className="section-label">HISTORICAL PRIVACY EVOLUTION</p>
        <h2>Transaction Privacy Timeline</h2>
        <p>Track how your address's privacy score evolved over time with each transaction event.</p>
      </div>

      <div className="timeline-chart-container">
        <div className="timeline-y-axis">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        <div className="timeline-points-row">
          {timeline.map((item, index) => {
            const scoreColor = getScoreColor(item.score_after);

            return (
              <div key={index} className="timeline-node">
                <div className="node-score-label" style={{ color: scoreColor }}>
                  {item.score_after}
                </div>

                <div
                  className="timeline-point"
                  style={{
                    bottom: `${item.score_after}%`,
                    borderColor: scoreColor,
                    backgroundColor: item.score_change < 0 ? "#ef4444" : "#10b981"
                  }}
                  title={`TX ${item.short_txid}: Score ${item.score_after}`}
                />

                <div className="node-info">
                  <span className="node-txid">{item.short_txid}</span>
                  <span className="node-date">
                    {item.timestamp ? new Date(item.timestamp * 1000).toLocaleDateString() : `Tx #${item.step}`}
                  </span>

                  {item.score_change !== 0 && (
                    <span className={`score-delta ${item.score_change < 0 ? "minus" : "plus"}`}>
                      {item.score_change} pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="timeline-events-list">
        <h3>Chronological Transaction Log</h3>
        {timeline.map((item, idx) => (
          <div key={idx} className="timeline-event-item">
            <div className="event-left">
              <span className="event-step">#{item.step}</span>
              <div className="event-details">
                <code>{item.txid}</code>
                <span className="event-meta">
                  {item.direction} • {item.amount_btc} BTC • Block {item.block_height || "Unconfirmed"}
                </span>
              </div>
            </div>

            <div className="event-right">
              <span className="event-badge">{item.event_label}</span>
              <span className="event-score-val" style={{ color: getScoreColor(item.score_after) }}>
                Score: {item.score_after}/100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivacyTimeline;
