import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import PrivacyChecker from "./pages/PrivacyChecker";
import Assistant from "./pages/Assistant";
import Knowledge from "./pages/Knowledge";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [latestReport, setLatestReport] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalysisComplete = (report) => {
    setLatestReport(report);
    setHistory((previous) => {
      const updated = [
        {
          address: report.address,
          score: report.score,
          rating: report.rating
        },
        ...previous
      ];
      return updated.slice(0, 5);
    });
  };

  const renderPage = () => {
    if (activePage === "dashboard") {
      return (
        <Dashboard
          history={history}
          latestReport={latestReport}
        />
      );
    }

    if (activePage === "privacy") {
      return (
        <PrivacyChecker
          onAnalysisComplete={handleAnalysisComplete}
        />
      );
    }

    if (activePage === "assistant") {
      return (
        <Assistant activeReport={latestReport} />
      );
    }

    if (activePage === "bitcoin") {
      return <Knowledge type="bitcoin" />;
    }

    if (activePage === "nostr") {
      return <Knowledge type="nostr" />;
    }

    return null;
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₿</div>
          <div>
            <h2>Bitcoin</h2>
            <span>Privacy Assistant</span>
          </div>
        </div>

        <nav className="navigation">
          <div className="nav-section-title">MAIN</div>

          <button
            className={activePage === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("dashboard")}
          >
            <span className="nav-icon">◈</span>
            <span>Dashboard</span>
          </button>

          <button
            className={activePage === "privacy" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("privacy")}
          >
            <span className="nav-icon">◇</span>
            <span>Privacy Checker</span>
          </button>

          <button
            className={activePage === "assistant" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("assistant")}
          >
            <span className="nav-icon">✦</span>
            <span>AI Assistant</span>
          </button>

          <div className="nav-section-title">KNOWLEDGE</div>

          <button
            className={activePage === "bitcoin" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("bitcoin")}
          >
            <span className="nav-icon">▣</span>
            <span>Bitcoin</span>
          </button>

          <button
            className={activePage === "nostr" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("nostr")}
          >
            <span className="nav-icon">◎</span>
            <span>Nostr</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="security-status">
            <span className="status-dot" />
            <div>
              <strong>Privacy First</strong>
              <small>Public data only</small>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-container">
        <header className="topbar">
          <div className="topbar-title">
            <span>BITCOIN PRIVACY ASSISTANT</span>
          </div>

          <div className="topbar-status">
            <span className="status-dot" />
            Backend connected
          </div>
        </header>

        <div className="content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default App;