function TransactionList({ count }) {

  return (
    <div className="transaction-card">

      <div className="card-heading">

        <div>
          <p className="section-label">
            BLOCKCHAIN DATA
          </p>

          <h2>Transaction Activity</h2>
        </div>

        <span className="transaction-count">
          {count} transactions
        </span>

      </div>

      <div className="transaction-summary">

        <div className="stat-box">
          <span>Transactions</span>
          <strong>{count}</strong>
        </div>

        <div className="stat-box">
          <span>Data Source</span>
          <strong>mempool.space</strong>
        </div>

        <div className="stat-box">
          <span>Analysis</span>
          <strong>Read-only</strong>
        </div>

      </div>

    </div>
  );
}

export default TransactionList;