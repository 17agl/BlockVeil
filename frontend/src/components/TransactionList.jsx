import { useState } from "react";

import TransactionDetail from "./TransactionDetail";


function formatBTC(
  amount
) {

  if (
    amount === undefined ||
    amount === null
  ) {
    return "0 BTC";
  }

  return (
    Number(amount).toFixed(8) +
    " BTC"
  );
}


function formatDate(
  timestamp
) {

  if (!timestamp) {
    return "Unconfirmed";
  }

  return new Date(
    timestamp * 1000
  ).toLocaleString();
}


function shortenTxid(
  txid
) {

  if (!txid) {
    return "Unknown";
  }

  if (txid.length <= 18) {
    return txid;
  }

  return (
    txid.slice(0, 10) +
    "..." +
    txid.slice(-8)
  );
}


function TransactionList({
  transactions = [],
  count = 0
}) {

  const [selectedTxid, setSelectedTxid] =
    useState(null);


  return (

    <>
      <div className="transaction-card">

        <div className="card-header">

          <div>

            <p className="section-label">
              BLOCKCHAIN ACTIVITY
            </p>

            <h2>
              Transaction History
            </h2>

          </div>

          <div className="transaction-total">
            {count}
          </div>

        </div>


        {transactions.length === 0 ? (

          <div className="transaction-empty">
            No transaction details are available.
          </div>

        ) : (

          <div className="transaction-table-wrapper">

            <table className="transaction-table">

              <thead>

                <tr>

                  <th>
                    Transaction
                  </th>

                  <th>
                    Direction
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {transactions.map(
                  (transaction) => (

                    <tr
                      key={
                        transaction.txid
                      }
                      className="clickable-row"
                      onClick={() =>
                        setSelectedTxid(
                          transaction.txid
                        )
                      }
                    >

                      <td>

                        <code
                          className="txid"
                          title={
                            transaction.txid
                          }
                        >
                          {shortenTxid(
                            transaction.txid
                          )}
                        </code>

                      </td>


                      <td>

                        <span
                          className={`direction ${transaction.direction
                            .toLowerCase()
                            .replace(
                              /[^a-z]+/g,
                              "-"
                            )}`}
                        >
                          {
                            transaction.direction
                          }
                        </span>

                      </td>


                      <td>

                        <strong>
                          {formatBTC(
                            transaction.amount
                          )}
                        </strong>

                      </td>


                      <td>

                        {transaction.confirmed ? (

                          <span className="confirmed">
                            Confirmed
                          </span>

                        ) : (

                          <span className="pending">
                            Pending
                          </span>

                        )}

                      </td>


                      <td>

                        <span className="tx-date">
                          {formatDate(
                            transaction.timestamp
                          )}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {selectedTxid && (

        <TransactionDetail
          txid={selectedTxid}
          onClose={() =>
            setSelectedTxid(null)
          }
        />

      )}

    </>

  );
}


export default TransactionList;