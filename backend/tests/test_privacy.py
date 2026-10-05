import pytest
from privacy.validation import validate_input_security, is_valid_bitcoin_address_syntax
from privacy.rules import run_all_rules, rule_address_reuse, rule_round_amount, rule_possible_change, rule_co_spending
from privacy.scoring import calculate_privacy_score, get_privacy_rating
from privacy.analyzer import analyze_address
from ai.retriever import retrieve_documents, tokenize


def test_validation_security_blocks_seed_phrase():
    seed_phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
    with pytest.raises(ValueError, match="SECURITY ALERT"):
        validate_input_security(seed_phrase)


def test_validation_security_blocks_private_key():
    wif_key = "5J3mBbAH58CpQ3Y5RNJpUKPE62SQ5tfcvE2JYo5ERBxKbrRvfKb"
    with pytest.raises(ValueError, match="SECURITY ALERT"):
        validate_input_security(wif_key)


def test_validation_security_blocks_nsec():
    nsec_key = "nsec1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    with pytest.raises(ValueError, match="SECURITY ALERT"):
        validate_input_security(nsec_key)


def test_valid_bitcoin_address_syntax():
    assert is_valid_bitcoin_address_syntax("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa") is True
    assert is_valid_bitcoin_address_syntax("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy") is True
    assert is_valid_bitcoin_address_syntax("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq") is True
    assert is_valid_bitcoin_address_syntax("invalid_address_123") is False


def test_rule_address_reuse():
    address = "bc1qtestaddress"
    transactions = [
        {
            "txid": "tx1",
            "vout": [{"scriptpubkey_address": address, "value": 100000}],
            "status": {"confirmed": True}
        },
        {
            "txid": "tx2",
            "vout": [{"scriptpubkey_address": address, "value": 200000}],
            "status": {"confirmed": True}
        }
    ]
    result = rule_address_reuse(transactions, address)
    assert result["detected"] is True
    assert result["count"] == 2
    assert len(result["why_detected"]) > 0


def test_rule_round_amount():
    address = "bc1qtestaddress"
    transactions = [
        {
            "txid": "tx1",
            "vout": [{"scriptpubkey_address": address, "value": 10_000_000}], # 0.1 BTC
            "status": {"confirmed": True}
        }
    ]
    result = rule_round_amount(transactions, address)
    assert result["detected"] is True
    assert result["count"] == 1


def test_rule_possible_change():
    address = "bc1qtarget"
    input_change_addr = "bc1qchange"
    transactions = [
        {
            "txid": "tx1",
            "vin": [
                {"prevout": {"scriptpubkey_address": address}},
                {"prevout": {"scriptpubkey_address": input_change_addr}}
            ],
            "vout": [
                {"scriptpubkey_address": address, "value": 50000},
                {"scriptpubkey_address": input_change_addr, "value": 120000} # Self-change reuse
            ]
        }
    ]
    result = rule_possible_change(transactions, address)
    assert result["detected"] is True
    assert len(result["evidence"]) > 0


def test_rule_co_spending():
    address = "bc1qprimary"
    other_addr = "bc1qsecondary"
    transactions = [
        {
            "txid": "tx1",
            "vin": [
                {"prevout": {"scriptpubkey_address": address}},
                {"prevout": {"scriptpubkey_address": other_addr}}
            ],
            "vout": [
                {"scriptpubkey_address": "bc1qrecipient", "value": 100000}
            ]
        }
    ]
    result = rule_co_spending(transactions, address)
    assert result["detected"] is True
    assert result["count"] == 1


def test_scoring_and_analyzer():
    address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    transactions = [
        {
            "txid": "tx1",
            "vin": [{"prevout": {"scriptpubkey_address": address}}],
            "vout": [{"scriptpubkey_address": address, "value": 100000}],
            "status": {"confirmed": True}
        },
        {
            "txid": "tx2",
            "vin": [{"prevout": {"scriptpubkey_address": address}}],
            "vout": [{"scriptpubkey_address": address, "value": 200000}],
            "status": {"confirmed": True}
        }
    ]
    report = analyze_address(address, transactions)
    assert report["address"] == address
    assert report["score"] < 100
    assert len(report["score_breakdown"]) > 0
    assert report["rating"] in ["Good", "Needs Improvement", "Poor", "Excellent"]


def test_rag_retriever():
    results = retrieve_documents("What is a UTXO?", top_k=2)
    assert len(results) > 0
    assert any("UTXO" in r["title"] or "utxo" in r["path"] for r in results)
