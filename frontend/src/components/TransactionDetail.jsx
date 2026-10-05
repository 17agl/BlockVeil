import { useEffect, useState } from "react";

import {
  getTransaction
} from "../services/api";


function formatBTC(
  satoshis
) {

  if (
    satoshis === undefined ||
    satoshis === null
  ) {
    return "0 BTC";
  }

  return (
    Number(
      satoshis
    ) /
    100000000
  ).toFixed(8) + " BTC";
}


function shorten(
  value
) {

  if (!value) {
    return "";
  }

  if (value.length < 20) {
    return value;
  }

  return (
    value.slice(0, 12) +
    "..." +
    value.slice(-10)
  );
}


function TransactionDetail({
  txid,
  onClose
}) {

  const [transaction, setTransaction] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function loadTransaction() {

      try {

        setLoading(true);

        const result =
          await getTransaction(
            txid
          );

        setTransaction(
          result
        );

      } catch (error) {

        setError(
          error.message
        );

      } finally {

        setLoading(false);

      }
    }


    if (txid) {

      loadTransaction();

    }

  }, [txid]);


  if (!txid) {
    return null;
  }


  return (

    <div className="transaction-detail-overlay">

      <div className="transaction-detail-panel">

        <div className="transaction-detail-header">

          <div>

            <p className="section-label">
              TRANSACTION DETAILS
            </p>

            <h2>
              Bitcoin Transaction
            </h2>

          </div>


          <button
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {loading && (

          <div className="detail-loading">
            Loading transaction...
          </div>

        )}


        {error && (

          <div className="error-box">
            {error}
          </div>

        )}


        {transaction && !loading && (

          <div className="transaction-detail-content">

            <div className="detail-txid">

              <span>
                TXID
              </span>

              <code>
                {transaction.txid}
              </code>

            </div>


            <div className="detail-grid">

              <div className="detail-stat">

                <span>
                  STATUS
                </span>

                <strong>
                  {transaction.status?.confirmed
                    ? "Confirmed"
                    : "Unconfirmed"}
                </strong>

              </div>


              <div className="detail-stat">

                <span>
                  FEE
                </span>

                <strong>
                  {formatBTC(
                    transaction.fee
                  )}
                </strong>

              </div>


              <div className="detail-stat">

                <span>
                  INPUTS
                </span>

                <strong>
                  {transaction.vin?.length || 0}
                </strong>

              </div>


              <div className="detail-stat">

                <span>
                  OUTPUTS
                </span>

                <strong>
                  {transaction.vout?.length || 0}
                </strong>

              </div>

            </div>


            <div className="detail-section">

              <h3>
                Inputs
              </h3>

              <div className="io-list">

                {transaction.vin?.map(
                  (input, index) => (

                    <div
                      className="io-item"
                      key={index}
                    >

                      <span>
                        Input {index + 1}
                      </span>

                      <code>
                        {shorten(
                          input.txid ||
                          "Coinbase"
                        )}
                      </code>

                      <strong>
                        {formatBTC(
                          input.prevout?.value
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>


            <div className="detail-section">

              <h3>
                Outputs
              </h3>

              <div className="io-list">

                {transaction.vout?.map(
                  (output, index) => (

                    <div
                      className="io-item"
                      key={index}
                    >

                      <span>
                        Output {index + 1}
                      </span>

                      <code>
                        {shorten(
                          output.scriptpubkey_address ||
                          "No address"
                        )}
                      </code>

                      <strong>
                        {formatBTC(
                          output.value
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


export default TransactionDetail;