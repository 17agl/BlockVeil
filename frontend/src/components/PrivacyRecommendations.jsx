function PrivacyRecommendations({ recommendations = [] }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-card">
      <div className="card-header">
        <p className="section-label">ACTIONABLE PRIVACY GUIDANCE</p>
        <h2>Tailored Privacy Recommendations</h2>
        <p>Follow these priority steps to improve your Bitcoin transaction privacy.</p>
      </div>

      <div className="recs-list">
        {recommendations.map((rec, index) => (
          <div key={index} className={`rec-item ${rec.priority}`}>
            <div className="rec-top">
              <span className="rec-badge">{rec.badge}</span>
              <strong>{rec.title}</strong>
            </div>

            <p className="rec-desc">{rec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivacyRecommendations;
