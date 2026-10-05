import { useState } from "react";

import AddressInput from "../components/AddressInput";
import PrivacyScore from "../components/PrivacyScore";
import PrivacyFlags from "../components/PrivacyFlags";
import PrivacyIndicator from "../components/PrivacyIndicator";
import PrivacyTimeline from "../components/PrivacyTimeline";
import AddressRelationshipGraph from "../components/AddressRelationshipGraph";
import PrivacySimulator from "../components/PrivacySimulator";
import PrivacyRecommendations from "../components/PrivacyRecommendations";
import PrivacyCategoryRadar from "../components/PrivacyCategoryRadar";
import NetworkStatusWidget from "../components/NetworkStatusWidget";
import ReportExporter from "../components/ReportExporter";
import TransactionList from "../components/TransactionList";
import Loading from "../components/Loading";

import { analyzeAddress, explainPrivacy } from "../services/api";

function PrivacyChecker({ onAnalysisComplete }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiSources, setAiSources] = useState([]);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  const handleAnalyze = async (address) => {
    setLoading(true);
    setError("");
    setReport(null);
    setAiExplanation("");
    setAiSources([]);
    setAiError("");

    try {
      const result = await analyzeAddress(address);
      setReport(result);

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      setError(err.message || "Unable to analyze address.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!report || aiLoading) return;

    setAiLoading(true);
    setAiError("");
    setAiExplanation("");
    setAiSources([]);

    try {
      const result = await explainPrivacy(report);
      setAiExplanation(result.explanation);
      setAiSources(result.sources || []);
    } catch (err) {
      setAiError(err.message || "Unable to generate AI explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  const addressInfo = report?.address_info || {};

  return (
    <main className="page">
      <div className="page-header">
        <p className="section-label">BITCOIN PRIVACY ENGINE</p>
        <h1>Address Privacy Checker & Investigation Suite</h1>
        <p>
          Comprehensive analysis of public Bitcoin addresses: heuristics, co-spending graph, historical timeline, and interactive What-If simulator.
        </p>
      </div>

      <NetworkStatusWidget />

      <div className="warning-banner">
        <strong>🛡️ Privacy Security Notice</strong>
        <span>
          Only enter a public Bitcoin address (e.g. 1..., 3..., bc1q..., bc1p...). Never submit private keys or seed phrases!
        </span>
      </div>

      <div className="analyzer-card">
        <AddressInput onAnalyze={handleAnalyze} loading={loading} />

        {loading && <Loading />}

        {error && <div className="error-box">⚠️ {error}</div>}

        {report && !loading && (
          <div className="results">
            <div className="address-header-card">
              <div className="address-main-info">
                <span className="info-label">ANALYZED PUBLIC ADDRESS</span>
                <code className="address-code">{report.address}</code>
              </div>

              <div className="address-meta-chips">
                <span className="meta-chip format">Format: {addressInfo.format || "Standard"}</span>
                <span className="meta-chip script">Script: {addressInfo.script_type || "N/A"}</span>
                <span className="meta-chip network">Network: {addressInfo.network || "Bitcoin Mainnet"}</span>
              </div>
            </div>

            <ReportExporter report={report} />

            <PrivacyScore
              score={report.score}
              rating={report.rating}
              scoreBreakdown={report.score_breakdown || []}
            />

            <PrivacyCategoryRadar categoryScores={report.category_scores || {}} />

            <PrivacyIndicator flags={report.flags || []} />

            <PrivacyFlags flags={report.flags || []} />

            <PrivacyRecommendations recommendations={report.recommendations || []} />

            <PrivacySimulator report={report} />

            <PrivacyTimeline timeline={report.timeline || []} />

            <AddressRelationshipGraph graph={report.relationship_graph || { nodes: [], edges: [] }} />

            <TransactionList
              count={report.transaction_count}
              transactions={report.transactions || []}
            />

            <div className="ai-explanation-card">
              <div className="ai-explanation-header">
                <div>
                  <p className="section-label">GROUNDED AI INVESTIGATION</p>
                  <h2>Explainable Privacy Analysis & Evidence</h2>
                  <p>
                    Generate a grounded AI explanation connecting detected signals to knowledge base concepts.
                  </p>
                </div>

                <button
                  className="ai-explain-button"
                  onClick={handleExplain}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Analyzing Evidence..." : "✦ Explain Findings with AI"}
                </button>
              </div>

              {aiError && <div className="error-box">⚠️ {aiError}</div>}

              {aiLoading && (
                <div className="ai-loading">
                  <span className="typing-dot">.</span> Analyzing blockchain privacy signals and retrieving knowledge base sources...
                </div>
              )}

              {aiExplanation && (
                <div className="ai-response">
                  <div className="ai-response-label">🤖 AI INVESTIGATION REPORT & FINDINGS</div>
                  <div className="ai-response-text" style={{ whiteSpace: "pre-wrap" }}>
                    {aiExplanation}
                  </div>

                  {aiSources.length > 0 && (
                    <div className="ai-sources">
                      <div className="ai-sources-title">GROUNDED KNOWLEDGE SOURCES</div>
                      <div className="sources-chips">
                        {aiSources.map((source) => (
                          <div className="ai-source" key={source.path}>
                            📄 {source.title || source.path} (Relevance: {source.score})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PrivacyChecker;