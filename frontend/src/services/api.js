const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error("Backend unavailable");
  }
  return data;
}

export async function fetchNetworkStatus() {
  const response = await fetch(`${API_BASE_URL}/api/privacy/network-status`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Unable to fetch network status");
  }
  return data;
}

export async function analyzeAddress(address) {
  const response = await fetch(`${API_BASE_URL}/api/privacy/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ address })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Unable to analyze address");
  }
  return data;
}

export async function explainPrivacy(report) {
  const response = await fetch(`${API_BASE_URL}/api/privacy/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ report })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Unable to generate AI explanation");
  }
  return data;
}

export async function askAssistant(question, activeReport = null) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question: question,
      active_report: activeReport
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Unable to get AI response");
  }
  return data;
}

export async function getTransaction(txid) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${txid}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Unable to load transaction.");
  }
  return data;
}