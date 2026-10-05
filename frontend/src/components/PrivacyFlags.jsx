function PrivacyFlags({ flags = [] }) {
  const detectedFlags = flags.filter((flag) => flag.detected);

  return (
    <div className="flags-card">
      <div className="card-header">
        <p className="section-label">PRIVACY FINDINGS & EVIDENCE</p>
        <h2>Detected Heuristic Patterns</h2>
      </div>

      {detectedFlags.length === 0 ? (
        <div className="no-flags">
          <div className="no-flags-icon">✓</div>
          <div>
            <strong>No privacy vulnerability signals detected</strong>
            <p>
              The analyzer did not detect receiving address reuse, multi-input co-spending, or round payment patterns for this address.
            </p>
          </div>
        </div>
      ) : (
        <div className="flags-list">
          {detectedFlags.map((flag, index) => (
            <div className="flag-item" key={flag.rule || index}>
              <div className="flag-top">
                <div className="flag-title-group">
                  <span className="flag-icon">⚠️</span>
                  <strong>{flag.title || flag.rule}</strong>
                </div>

                <div className="badge-group">
                  <span className={`severity ${flag.severity}`}>
                    Severity: {flag.severity}
                  </span>
                  {flag.confidence && (
                    <span className={`confidence ${flag.confidence}`}>
                      Confidence: {flag.confidence}
                    </span>
                  )}
                </div>
              </div>

              <p className="flag-message">{flag.message}</p>

              {flag.why_detected && flag.why_detected.length > 0 && (
                <div className="why-detected-box">
                  <div className="box-subtitle">WHY WAS THIS DETECTED? (EVIDENCE)</div>
                  <ul className="evidence-list">
                    {flag.why_detected.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {flag.mitigation && (
                <div className="mitigation-box">
                  <span className="mitigation-icon">💡</span>
                  <div>
                    <strong>How to mitigate:</strong> {flag.mitigation}
                  </div>
                </div>
              )}

              {flag.details && (
                <div className="flag-details">
                  <small>{flag.details}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrivacyFlags;