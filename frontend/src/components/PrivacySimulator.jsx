import { useState } from "react";

function PrivacySimulator({ report }) {
  const baseScore = report ? report.score : 55;
  const flags = report ? report.flags : [];

  const hasReuse = flags.some((f) => f.rule === "address_reuse" && f.detected);
  const hasCoSpend = flags.some((f) => f.rule === "co_spending" && f.detected);
  const hasRound = flags.some((f) => f.rule === "round_amount" && f.detected);

  const [fixReuse, setFixReuse] = useState(false);
  const [fixCoSpend, setFixCoSpend] = useState(false);
  const [fixRound, setFixRound] = useState(false);
  const [useCoinJoin, setUseCoinJoin] = useState(false);

  let simulatedScore = baseScore;

  if (useCoinJoin) {
    simulatedScore = 95;
  } else {
    if (fixReuse && hasReuse) simulatedScore += 30;
    if (fixCoSpend && hasCoSpend) simulatedScore += 25;
    if (fixRound && hasRound) simulatedScore += 15;
    simulatedScore = Math.min(100, simulatedScore);
  }

  const scoreGain = simulatedScore - baseScore;

  return (
    <div className="simulator-card">
      <div className="card-header">
        <p className="section-label">INTERACTIVE DECISION SUPPORT</p>
        <h2>Privacy "What-If" Simulator</h2>
        <p>Simulate privacy practice changes and see how your estimated score would improve.</p>
      </div>

      <div className="simulator-display">
        <div className="score-comparison-box">
          <div className="comp-item">
            <span className="comp-label">CURRENT SCORE</span>
            <span className="comp-val original">{baseScore}</span>
          </div>

          <div className="comp-arrow">➔</div>

          <div className="comp-item">
            <span className="comp-label">SIMULATED SCORE</span>
            <span className="comp-val simulated">{simulatedScore}</span>
          </div>

          {scoreGain > 0 && (
            <div className="gain-badge">
              +{scoreGain} pts estimated gain
            </div>
          )}
        </div>
      </div>

      <div className="simulator-options-grid">
        <label className={`sim-checkbox-card ${fixReuse ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={fixReuse}
            onChange={(e) => setFixReuse(e.target.checked)}
            disabled={useCoinJoin || !hasReuse}
          />
          <div>
            <strong>Use Fresh Address for Every Payment</strong>
            <p>Eliminates receiving address reuse (+30 pts)</p>
          </div>
        </label>

        <label className={`sim-checkbox-card ${fixCoSpend ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={fixCoSpend}
            onChange={(e) => setFixCoSpend(e.target.checked)}
            disabled={useCoinJoin || !hasCoSpend}
          />
          <div>
            <strong>Avoid Multi-Input UTXO Co-Spending</strong>
            <p>Uses Coin Control to isolate inputs (+25 pts)</p>
          </div>
        </label>

        <label className={`sim-checkbox-card ${fixRound ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={fixRound}
            onChange={(e) => setFixRound(e.target.checked)}
            disabled={useCoinJoin || !hasRound}
          />
          <div>
            <strong>Vary Payment Amounts</strong>
            <p>Avoids round decimal values (+15 pts)</p>
          </div>
        </label>

        <label className={`sim-checkbox-card highlight ${useCoinJoin ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={useCoinJoin}
            onChange={(e) => setUseCoinJoin(e.target.checked)}
          />
          <div>
            <strong>🌀 Execute CoinJoin Mixing Protocol</strong>
            <p>Breaks transaction history linkages completely (Score ➔ 95/100)</p>
          </div>
        </label>
      </div>

      <p className="sim-disclaimer">
        * Note: Estimated score improvements are based on application rules and heuristics. Real-world privacy depends on complete wallet coin control practices.
      </p>
    </div>
  );
}

export default PrivacySimulator;
