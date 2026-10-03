import { useState } from "react";

import AddressInput from "../components/AddressInput";
import PrivacyScore from "../components/PrivacyScore";
import PrivacyFlags from "../components/PrivacyFlags";
import TransactionList from "../components/TransactionList";
import Loading from "../components/Loading";

import { analyzeAddress } from "../services/api";


function PrivacyChecker() {

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleAnalyze = async (address) => {

    setLoading(true);
    setError("");
    setReport(null);

    try {

      const result =
        await analyzeAddress(address);

      setReport(result);

    } catch (error) {

      setError(
        error.message ||
        "Unable to analyze address."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <main className="page">

      <div className="page-header">

        <div>
          <p className="section-label">
            BITCOIN PRIVACY
          </p>

          <h1>
            Privacy Checker
          </h1>

          <p>
            Analyze publicly available Bitcoin
            transaction activity for common
            privacy patterns.
          </p>
        </div>

      </div>


      <div className="warning-banner">

        <span>ⓘ</span>

        <p>
          <strong>Read-only analysis.</strong>{" "}
          This tool never asks for or handles
          private keys, seed phrases, or wallet
          credentials.
        </p>

      </div>


      <section className="analyzer-card">

        <h2>
          Analyze a Bitcoin Address
        </h2>

        <p>
          Enter a public Bitcoin address to
          inspect its observable transaction
          history.
        </p>

        <AddressInput
          onAnalyze={handleAnalyze}
          loading={loading}
        />

      </section>


      {loading && <Loading />}


      {error && (

        <div className="error-box">
          <strong>Analysis failed</strong>
          <p>{error}</p>
        </div>

      )}


      {report && !loading && (

        <div className="results">

          <div className="address-result">

            <span>Analyzed address</span>

            <code>
              {report.address}
            </code>

          </div>


          <PrivacyScore
            score={report.score}
            rating={report.rating}
          />


          <PrivacyFlags
            flags={report.flags}
          />


          <TransactionList
            count={report.transaction_count}
          />

        </div>

      )}

    </main>
  );
}

export default PrivacyChecker;