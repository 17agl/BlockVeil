"""
Bitcoin Privacy Analysis Rules

These rules are heuristics based on public blockchain analysis.

They do NOT prove:
- ownership
- identity
- intent
- wallet type

They identify observable transaction patterns and present empirical evidence.
"""

from typing import List, Dict, Any

# Round amount thresholds in Satoshis
# (e.g. 1 BTC, 0.5 BTC, 0.1 BTC, 0.05 BTC, 0.01 BTC, 0.005 BTC, 0.001 BTC, 100k sats)
ROUND_SAT_THRESHOLDS = [
    100_000_000, # 1.0 BTC
    50_000_000,  # 0.5 BTC
    10_000_000,  # 0.1 BTC
    5_000_000,   # 0.05 BTC
    1_000_000,   # 0.01 BTC
    500_000,     # 0.005 BTC
    100_000,     # 0.001 BTC
]


def sats_to_btc(satoshis: int) -> float:
    return round(satoshis / 100_000_000, 8)


def is_round_sats(satoshis: int) -> bool:
    """Check if satoshi value matches a round decimal BTC or round satoshi threshold."""
    if satoshis <= 0:
        return False
    for threshold in ROUND_SAT_THRESHOLDS:
        if satoshis % threshold == 0:
            return True
    return False


def get_address_script_type(address: str) -> str:
    """Helper to classify Bitcoin address format by prefix."""
    if address.startswith("1") or address.startswith("m") or address.startswith("n"):
        return "Legacy (P2PKH)"
    elif address.startswith("3") or address.startswith("2"):
        return "Nested SegWit / P2SH"
    elif address.startswith("bc1q") or address.startswith("tb1q"):
        return "Native SegWit (P2WPKH)"
    elif address.startswith("bc1p") or address.startswith("tb1p"):
        return "Taproot (P2TR)"
    return "Unknown Script Type"


def rule_address_reuse(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Detect whether the address received funds multiple times across separate transactions.
    """
    receiving_txs = []
    total_received_sats = 0

    for tx in transactions:
        txid = tx.get("txid", "")
        for output in tx.get("vout", []):
            out_addr = output.get("scriptpubkey_address")
            val = output.get("value", 0)
            if out_addr == address and val > 0:
                receiving_txs.append({
                    "txid": txid,
                    "satoshis": val,
                    "btc": sats_to_btc(val),
                    "block_height": tx.get("status", {}).get("block_height")
                })
                total_received_sats += val

    # De-duplicate by TXID
    unique_txids = list({item["txid"] for item in receiving_txs})
    count = len(unique_txids)
    detected = count > 1

    why_detected = []
    if detected:
        why_detected = [
            f"Address received funds in {count} separate transactions.",
            f"Total satoshis received across reuses: {total_received_sats:,} sats ({sats_to_btc(total_received_sats)} BTC).",
            "Reusing a single receiving address links multiple distinct payments together on the public ledger.",
            "External observers can associate all transactions involving this address with the same owner."
        ]
    else:
        why_detected = [
            "Address has not been reused for receiving multiple payments (or has only 1 incoming transaction)."
        ]

    return {
        "rule": "address_reuse",
        "title": "Address Reuse",
        "detected": detected,
        "severity": "high" if detected else "none",
        "confidence": "high" if detected else "none",
        "count": count,
        "evidence": receiving_txs[:10],
        "why_detected": why_detected,
        "details": "Reusing Bitcoin addresses compromises privacy by linking all past and future transactions to a single identity fingerprint.",
        "mitigation": "Use a fresh, newly generated Bitcoin address for every incoming transaction."
    }


def rule_round_amount(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Detect transactions where payment amounts are round numbers (e.g. 0.1 BTC, 0.01 BTC, 100,000 sats).
    """
    matches = []

    for tx in transactions:
        txid = tx.get("txid", "")
        for vout_idx, output in enumerate(tx.get("vout", [])):
            out_addr = output.get("scriptpubkey_address")
            val = output.get("value", 0)

            if out_addr == address and val > 0 and is_round_sats(val):
                matches.append({
                    "txid": txid,
                    "vout_index": vout_idx,
                    "satoshis": val,
                    "btc": sats_to_btc(val)
                })

    count = len(matches)
    detected = count > 0

    sample_str = ", ".join([f"{m['btc']} BTC" for m in matches[:3]]) if matches else ""

    why_detected = []
    if detected:
        why_detected = [
            f"Detected {count} output(s) with round payment amounts ({sample_str}).",
            "Human senders frequently send round values (e.g., 0.1 BTC or 1,000,000 sats).",
            "In a 2-output transaction, a round payment amount makes it easy for chain analysis to distinguish the intended payment from the change output."
        ]
    else:
        why_detected = [
            "No round-number payment amounts were detected for this address."
        ]

    return {
        "rule": "round_amount",
        "title": "Round Amount Payment",
        "detected": detected,
        "severity": "medium" if detected else "none",
        "confidence": "medium" if detected else "none",
        "count": count,
        "evidence": matches[:10],
        "why_detected": why_detected,
        "details": "Distinctive round-number payment amounts reduce transaction entropy and assist heuristic clustering.",
        "mitigation": "Avoid round payment amounts when possible, or use PayJoin / CoinJoin protocols to obfuscate payment values."
    }


def rule_possible_change(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Identify candidate change output patterns using multi-indicator heuristics:
    1. Input address reuse output (Self-change)
    2. Round payment vs non-round change pairing
    3. Input script type matching
    """
    matches = []

    for tx in transactions:
        txid = tx.get("txid", "")
        vins = tx.get("vin", [])
        vouts = tx.get("vout", [])

        if len(vins) < 1 or len(vouts) < 2:
            continue

        input_addresses = {
            vin.get("prevout", {}).get("scriptpubkey_address")
            for vin in vins
            if vin.get("prevout", {}).get("scriptpubkey_address")
        }

        input_script_types = {
            get_address_script_type(addr) for addr in input_addresses
        }

        for vout_idx, output in enumerate(vouts):
            out_addr = output.get("scriptpubkey_address")
            val = output.get("value", 0)

            if not out_addr or val <= 0:
                continue

            reasons = []

            # Sub-heuristic 1: Output address matches one of the input addresses (Self-address change)
            if out_addr in input_addresses and out_addr != address:
                reasons.append("Output address matches transaction input address (Self-address change reuse)")

            # Sub-heuristic 2: Round payment vs Non-round output pairing
            if len(vouts) == 2:
                other_output = vouts[1 if vout_idx == 0 else 0]
                other_val = other_output.get("value", 0)
                if is_round_sats(other_val) and not is_round_sats(val):
                    reasons.append("Non-round output paired with a round payment output")

            # Sub-heuristic 3: Script type inheritance
            if len(vouts) == 2:
                out_script_type = get_address_script_type(out_addr)
                other_addr = vouts[1 if vout_idx == 0 else 0].get("scriptpubkey_address", "")
                other_script_type = get_address_script_type(other_addr) if other_addr else ""

                if out_script_type in input_script_types and other_script_type not in input_script_types:
                    reasons.append(f"Output inherits input script format ({out_script_type}) while peer output differs")

            if reasons:
                matches.append({
                    "txid": txid,
                    "candidate_address": out_addr,
                    "satoshis": val,
                    "btc": sats_to_btc(val),
                    "reasons": reasons
                })

    count = len(matches)
    detected = count > 0

    why_detected = []
    if detected:
        why_detected = [
            f"Identified {count} candidate change-output pattern(s).",
            "Heuristic indicators matched: address reuse in inputs, non-round change pairing, or input script-type inheritance.",
            "Confidence is medium: heuristics indicate probable change creation but cannot prove wallet ownership."
        ]
        # Add sample reason
        if matches:
            why_detected.append(f"Sample evidence: {matches[0]['reasons'][0]}")
    else:
        why_detected = [
            "No obvious change-output heuristics were triggered."
        ]

    return {
        "rule": "change_output",
        "title": "Possible Change Output",
        "detected": detected,
        "severity": "medium" if detected else "none",
        "confidence": "medium" if detected else "none",
        "count": count,
        "evidence": matches[:10],
        "why_detected": why_detected,
        "details": "Change outputs can reveal wallet ownership when wallets reuse input script types or create recognizable non-round outputs.",
        "mitigation": "Configure wallets to use randomized script types or sub-sats change avoiding distinct patterns."
    }


def rule_co_spending(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Common Input Ownership Heuristic (CIOH):
    Detects multi-input transactions co-spending inputs from multiple distinct addresses.
    """
    matches = []

    for tx in transactions:
        txid = tx.get("txid", "")
        vins = tx.get("vin", [])

        input_addresses = {
            vin.get("prevout", {}).get("scriptpubkey_address")
            for vin in vins
            if vin.get("prevout", {}).get("scriptpubkey_address")
        }

        # Check if analyzed address was part of this spending transaction
        if address in input_addresses and len(input_addresses) > 1:
            co_spent_others = list(input_addresses - {address})
            matches.append({
                "txid": txid,
                "input_count": len(vins),
                "distinct_address_count": len(input_addresses),
                "co_spent_addresses": co_spent_others[:5]
            })

    count = len(matches)
    detected = count > 0

    why_detected = []
    if detected:
        total_co_spent_addrs = sum(m["distinct_address_count"] - 1 for m in matches)
        why_detected = [
            f"Address was co-spent alongside {total_co_spent_addrs} other input address(es) across {count} multi-input transaction(s).",
            "The Common Input Ownership Heuristic (CIOH) assumes all inputs in a standard multi-input transaction belong to the same entity.",
            "Co-spending merges separate UTXOs into a single cluster, revealing combined wallet holdings to blockchain observers."
        ]
    else:
        why_detected = [
            "No multi-input co-spending with other addresses was detected for this address."
        ]

    return {
        "rule": "co_spending",
        "title": "Multi-Input Co-Spending (CIOH)",
        "detected": detected,
        "severity": "high" if detected else "none",
        "confidence": "high" if detected else "none",
        "count": count,
        "evidence": matches[:10],
        "why_detected": why_detected,
        "details": "Co-spending multiple UTXOs in one transaction enables public blockchain observers to link all involved input addresses to the same wallet.",
        "mitigation": "Avoid spending multiple UTXOs at once, or use CoinJoin transactions (like Whirlpool or JoinMarket) to break co-spending linkages."
    }


def rule_script_type_mix(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Analyze script format used by address and flag legacy formats.
    """
    script_type = get_address_script_type(address)
    is_legacy = "Legacy" in script_type

    why_detected = [
        f"Analyzed address script type: {script_type}."
    ]

    if is_legacy:
        why_detected.append("Legacy P2PKH addresses (starting with '1') lack modern SegWit/Taproot privacy efficiency and feature distinct script signatures.")
    else:
        why_detected.append("Address uses modern SegWit/Taproot script formatting.")

    return {
        "rule": "script_type",
        "title": "Address Script Type Analysis",
        "detected": is_legacy,
        "severity": "low" if is_legacy else "none",
        "confidence": "high",
        "count": 1,
        "evidence": [{"address": address, "script_type": script_type}],
        "why_detected": why_detected,
        "details": "Legacy address types have higher fees and distinct fingerprints compared to Taproot or Native SegWit.",
        "mitigation": "Upgrade wallet to Native SegWit (bc1q) or Taproot (bc1p) addresses."
    }


def run_all_rules(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    return {
        "address_reuse": rule_address_reuse(transactions, address),
        "round_amount": rule_round_amount(transactions, address),
        "possible_change": rule_possible_change(transactions, address),
        "co_spending": rule_co_spending(transactions, address),
        "script_type": rule_script_type_mix(transactions, address)
    }