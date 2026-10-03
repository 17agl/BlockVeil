function PrivacyScore({ score, rating }) {

  const getScoreClass = () => {

    if (score >= 80) {
      return "score-good";
    }

    if (score >= 50) {
      return "score-warning";
    }

    return "score-poor";
  };

  return (
    <div className="score-card">

      <div className="score-header">
        <div>
          <p className="section-label">
            PRIVACY SCORE
          </p>

          <h2>{rating}</h2>
        </div>

        <div className={`score-circle ${getScoreClass()}`}>
          <span>{score}</span>
          <small>/100</small>
        </div>
      </div>

      <div className="score-bar">
        <div
          className={`score-fill ${getScoreClass()}`}
          style={{
            width: `${score}%`,
          }}
        ></div>
      </div>

      <p className="score-description">
        This score is a project-defined heuristic
        based on observable blockchain patterns.
      </p>

    </div>
  );
}

export default PrivacyScore;