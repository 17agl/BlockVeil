function PrivacyIndicator({ flags = [] }) {
  const getIcon = (rule) => {
    switch (rule) {
      case "address_reuse":
        return "🔴";
      case "co_spending":
        return "🔴";
      case "round_amount":
        return "🟠";
      case "possible_change":
        return "🟡";
      case "script_type":
        return "🔵";
      default:
        return "⚪";
    }
  };

  const getSignalIntensity = (flag) => {
    if (!flag.detected) return 0;
    if (flag.severity === "high") return 100;
    if (flag.severity === "medium") return 65;
    if (flag.severity === "low") return 35;
    return 0;
  };

  return (
    <div className="privacy-indicator-card">
      <div className="card-header">
        <p className="section-label">PRIVACY SIGNAL VISUALIZATION</p>
        <h2>Privacy Signal Intensity Breakdown</h2>
      </div>

      <div className="signal-bars-container">
        {flags.map((flag) => {
          const intensity = getSignalIntensity(flag);
          const icon = getIcon(flag.rule);

          return (
            <div key={flag.rule} className="signal-bar-row">
              <div className="signal-label-group">
                <span className="signal-icon">{icon}</span>
                <span className="signal-name">{flag.title || flag.rule}</span>
                <span className={`signal-badge ${flag.severity}`}>
                  {flag.detected ? flag.severity.toUpperCase() : "CLEAN"}
                </span>
              </div>

              <div className="signal-track">
                <div
                  className={`signal-fill ${flag.severity}`}
                  style={{ width: `${intensity}%` }}
                />
              </div>

              <div className="signal-count-text">
                {flag.detected ? `${flag.count} detected` : "0 signals"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PrivacyIndicator;