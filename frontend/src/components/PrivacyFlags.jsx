function PrivacyFlags({ flags }) {

  const visibleFlags = flags.filter(
    (flag) => flag.detected
  );

  return (
    <div className="flags-card">

      <div className="card-heading">
        <div>
          <p className="section-label">
            PRIVACY ANALYSIS
          </p>

          <h2>Detected Patterns</h2>
        </div>

        <span className="flag-count">
          {visibleFlags.length} detected
        </span>
      </div>

      {visibleFlags.length === 0 ? (

        <div className="no-flags">
          <span>✓</span>

          <div>
            <strong>
              No privacy flags detected
            </strong>

            <p>
              None of the current heuristic
              rules were triggered.
            </p>
          </div>
        </div>

      ) : (

        <div className="flags-list">

          {visibleFlags.map((flag) => (

            <div
              className={`flag-item ${flag.severity}`}
              key={flag.rule}
            >

              <div className="flag-icon">
                {flag.severity === "high"
                  ? "!"
                  : "⚠"}
              </div>

              <div className="flag-content">

                <strong>
                  {formatRuleName(flag.rule)}
                </strong>

                <p>
                  {flag.message}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}


function formatRuleName(rule) {

  return rule
    .split("_")
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


export default PrivacyFlags;