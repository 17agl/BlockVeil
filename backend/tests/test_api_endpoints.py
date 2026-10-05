import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_network_status_endpoint():
    response = client.get("/api/privacy/network-status")
    assert response.status_code == 200
    data = response.json()
    assert "block_height" in data
    assert "fees" in data


def test_analyze_empty_address_fails():
    response = client.post("/api/privacy/analyze", json={"address": ""})
    assert response.status_code == 400
    assert "required" in response.json()["detail"].lower()


def test_analyze_seed_phrase_security_rejection():
    seed_phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    response = client.post("/api/privacy/analyze", json={"address": seed_phrase})
    assert response.status_code == 400
    assert "SECURITY ALERT" in response.json()["detail"]


def test_analyze_invalid_address_syntax_rejection():
    response = client.post("/api/privacy/analyze", json={"address": "invalid_btc_address_12345"})
    assert response.status_code == 400
    assert "Invalid Bitcoin address format" in response.json()["detail"]


def test_chat_endpoint():
    response = client.post("/api/chat", json={"question": "What is a UTXO?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data


def test_chat_seed_phrase_security_rejection():
    seed_phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    response = client.post("/api/chat", json={"question": seed_phrase})
    assert response.status_code == 400
    assert "SECURITY ALERT" in response.json()["detail"]
