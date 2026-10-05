import NetworkStatusWidget from "../components/NetworkStatusWidget";

function Dashboard({ history = [], latestReport }) {
  const totalAnalyses = history.length;
  const latestScore = latestReport?.score ?? "--";
  const latestRating = latestReport?.rating ?? "No analysis yet";
  const latestTransactions = latestReport?.transaction_count ?? 0;
  const detectedFlags = latestReport?.flags?.filter((flag) => flag.detected).length || 0;

  return (
    <main className="page">
      <div className="page-header">
        <p className="section-label">EXECUTIVE SUMMARY</p>
        <h1>Bitcoin Privacy Dashboard</h1>
        <p>Real-time Bitcoin network metrics and privacy analysis overview.</p>
      </div>

      <NetworkStatusWidget />

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">◈</div>
          <div>
            <span>TOTAL ANALYSES</span>
            <strong>{totalAnalyses}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">◉</div>
          <div>
            <span>LATEST PRIVACY SCORE</span>
            <strong>{latestScore}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">⚠</div>
          <div>
            <span>DETECTED RISKS</span>
            <strong>{detectedFlags}</strong>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon">₿</div>
          <div>
            <span>TRANSACTIONS ANALYZED</span>
            <strong>{latestTransactions}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-panel">
          <div className="card-header">
            <p className="section-label">LATEST ASSESSMENT</p>
            <h2>Current Address Status</h2>
          </div>

          {!latestReport ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">◈</div>
              <h3>No address analyzed yet</h3>
              <p>Go to Address Privacy Checker and enter a public Bitcoin address to generate full privacy diagnostics.</p>
            </div>
          ) : (
            <div className="latest-analysis">
              <div className="latest-score">
                <div className="large-score">{latestScore}</div>
                <div>
                  <span>Privacy Rating</span>
                  <strong>{latestRating}</strong>
                </div>
              </div>

              <div className="latest-address">
                <span>ANALYZED PUBLIC ADDRESS</span>
                <code>{latestReport.address}</code>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="card-header">
            <p className="section-label">PRIVACY SIGNALS SUMMARY</p>
            <h2>Detected Heuristic Patterns</h2>
          </div>

          {!latestReport ? (
            <p className="muted">Privacy signal indicators will appear here once an address is analyzed.</p>
          ) : (
            <div className="dashboard-flags">
              {latestReport.flags
                ?.filter((flag) => flag.detected)
                .map((flag) => (
                  <div className="dashboard-flag" key={flag.rule}>
                    <span>{flag.severity === "high" ? "🔴" : flag.severity === "medium" ? "🟠" : "🔵"}</span>
                    <div>
                      <strong>{flag.title || flag.rule}</strong>
                      <p>{flag.message}</p>
                    </div>
                  </div>
                ))}

              {detectedFlags === 0 && (
                <div className="dashboard-success">
                  ✓ No configured privacy vulnerability signals detected for this address.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="card-header">
          <p className="section-label">SESSION LOG</p>
          <h2>Analysis History</h2>
        </div>

        {history.length === 0 ? (
          <div className="dashboard-empty small">
            <p>Your completed address analyses during this active session will be logged here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div className="history-item" key={`${item.address}-${index}`}>
                <div>
                  <strong>{item.rating}</strong>
                  <code>{item.address}</code>
                </div>

                <div className="history-score">{item.score}/100</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;