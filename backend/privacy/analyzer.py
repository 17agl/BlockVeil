from typing import List, Dict, Any

from .rules import run_all_rules, sats_to_btc, get_address_script_type, is_round_sats
from .scoring import calculate_privacy_score, get_privacy_rating


def get_input_value(transaction: Dict[str, Any], address: str) -> int:
    total = 0
    for vin in transaction.get("vin", []):
        prevout = vin.get("prevout") or {}
        input_address = prevout.get("scriptpubkey_address")
        if input_address == address:
            total += prevout.get("value", 0)
    return total


def get_output_value(transaction: Dict[str, Any], address: str) -> int:
    total = 0
    for vout in transaction.get("vout", []):
        output_address = vout.get("scriptpubkey_address")
        if output_address == address:
            total += vout.get("value", 0)
    return total


def get_timestamp(transaction: Dict[str, Any]) -> Any:
    status = transaction.get("status", {})
    if status.get("confirmed"):
        return status.get("block_time")
    return None


def get_address_format_info(address: str) -> Dict[str, Any]:
    script_type = get_address_script_type(address)

    if address.startswith("bc1q") or address.startswith("tb1q"):
        format_name = "Bech32 Native SegWit"
        encoding = "Bech32"
    elif address.startswith("bc1p") or address.startswith("tb1p"):
        format_name = "Bech32m Taproot"
        encoding = "Bech32m"
    elif address.startswith("3") or address.startswith("2"):
        format_name = "Base58 P2SH"
        encoding = "Base58Check"
    else:
        format_name = "Base58 P2PKH"
        encoding = "Base58Check"

    is_testnet = address.startswith("tb1") or address.startswith("m") or address.startswith("n") or address.startswith("2")
    network = "Bitcoin Testnet" if is_testnet else "Bitcoin Mainnet"

    return {
        "address": address,
        "script_type": script_type,
        "format": format_name,
        "encoding": encoding,
        "network": network
    }


def build_transaction_details(transactions: List[Dict[str, Any]], address: str) -> List[Dict[str, Any]]:
    result = []
    for tx in transactions:
        txid = tx.get("txid", "")
        sent = get_input_value(tx, address)
        received = get_output_value(tx, address)

        if sent == 0 and received == 0:
            continue

        if sent > 0 and received > 0:
            direction = "Self / Mixed"
        elif sent > 0:
            direction = "Sent"
        else:
            direction = "Received"

        if direction == "Sent":
            amount = sent
        elif direction == "Received":
            amount = received
        else:
            amount = max(sent, received)

        status = tx.get("status", {})

        result.append({
            "txid": txid,
            "direction": direction,
            "amount": sats_to_btc(amount),
            "sent_amount": sats_to_btc(sent),
            "received_amount": sats_to_btc(received),
            "fee": sats_to_btc(tx.get("fee", 0)),
            "confirmed": status.get("confirmed", False),
            "block_height": status.get("block_height"),
            "timestamp": get_timestamp(tx),
            "inputs": len(tx.get("vin", [])),
            "outputs": len(tx.get("vout", []))
        })
    return result


def build_privacy_timeline(transactions: List[Dict[str, Any]], address: str) -> List[Dict[str, Any]]:
    """
    Build a chronological timeline tracking privacy score evolution and signals over time.
    """
    sorted_txs = sorted(
        transactions,
        key=lambda tx: tx.get("status", {}).get("block_time") or 0
    )

    timeline = []
    running_score = 100
    receiving_count = 0

    for idx, tx in enumerate(sorted_txs):
        txid = tx.get("txid", "")
        status = tx.get("status", {})
        block_time = status.get("block_time")
        block_height = status.get("block_height")

        sent = get_input_value(tx, address)
        received = get_output_value(tx, address)

        if sent == 0 and received == 0:
            continue

        direction = "Received" if received > sent else ("Sent" if sent > received else "Mixed")
        amount = received if direction == "Received" else sent
        amount_btc = sats_to_btc(amount)

        score_change = 0
        event_labels = []

        if direction == "Received" and received > 0:
            receiving_count += 1
            if receiving_count > 1:
                score_change -= 25
                event_labels.append("Address Reuse Event")

        vins = tx.get("vin", [])
        input_addrs = {
            vin.get("prevout", {}).get("scriptpubkey_address")
            for vin in vins if vin.get("prevout", {}).get("scriptpubkey_address")
        }

        if address in input_addrs and len(input_addrs) > 1:
            score_change -= 20
            event_labels.append("Co-Spending Event (CIOH)")

        vouts = tx.get("vout", [])
        for output in vouts:
            val = output.get("value", 0)
            if output.get("scriptpubkey_address") == address and is_round_sats(val):
                score_change -= 10
                event_labels.append("Round Amount Payment")
                break

        running_score = max(0, min(100, running_score + score_change))

        timeline.append({
            "step": idx + 1,
            "txid": txid,
            "short_txid": f"{txid[:6]}...{txid[-4:]}" if txid else "",
            "timestamp": block_time,
            "block_height": block_height,
            "direction": direction,
            "amount_btc": amount_btc,
            "score_after": running_score,
            "score_change": score_change,
            "event_label": ", ".join(event_labels) if event_labels else "Standard Transaction"
        })

    return timeline


def build_relationship_graph(transactions: List[Dict[str, Any]], address: str) -> Dict[str, Any]:
    """
    Build an interactive node-and-edge graph of address relationships.
    Identifies co-spent inputs, recipient addresses, and change candidate addresses.
    """
    nodes_dict = {
        address: {
            "id": address,
            "label": f"Primary ({address[:6]}...{address[-4:]})",
            "type": "primary",
            "script_type": get_address_script_type(address),
            "full_address": address
        }
    }

    edges = []

    for tx in transactions:
        txid = tx.get("txid", "")
        short_txid = f"{txid[:6]}...{txid[-4:]}" if txid else ""
        vins = tx.get("vin", [])
        vouts = tx.get("vout", [])

        input_addrs = [
            vin.get("prevout", {}).get("scriptpubkey_address")
            for vin in vins
            if vin.get("prevout", {}).get("scriptpubkey_address")
        ]

        if address in input_addrs:
            for in_addr in set(input_addrs):
                if in_addr != address:
                    if in_addr not in nodes_dict:
                        nodes_dict[in_addr] = {
                            "id": in_addr,
                            "label": f"Co-Spent ({in_addr[:6]}...{in_addr[-4:]})",
                            "type": "co_spent",
                            "script_type": get_address_script_type(in_addr),
                            "full_address": in_addr
                        }
                    edges.append({
                        "source": in_addr,
                        "target": address,
                        "txid": txid,
                        "type": "co_spend",
                        "explanation": f"Co-spent together in multi-input TX {short_txid}. Reveals Common Input Ownership (CIOH)."
                    })

        for vout in vouts:
            out_addr = vout.get("scriptpubkey_address")
            val = vout.get("value", 0)
            if not out_addr or out_addr == address:
                continue

            is_change = out_addr in input_addrs
            node_type = "change" if is_change else "recipient"
            label_prefix = "Candidate Change" if is_change else "Recipient"

            if out_addr not in nodes_dict:
                nodes_dict[out_addr] = {
                    "id": out_addr,
                    "label": f"{label_prefix} ({out_addr[:6]}...{out_addr[-4:]})",
                    "type": node_type,
                    "script_type": get_address_script_type(out_addr),
                    "full_address": out_addr
                }

            edges.append({
                "source": address,
                "target": out_addr,
                "txid": txid,
                "amount_btc": sats_to_btc(val),
                "type": node_type,
                "explanation": (
                    f"Possible change output of {sats_to_btc(val)} BTC in TX {short_txid}."
                    if is_change
                    else f"Payment output of {sats_to_btc(val)} BTC sent to recipient in TX {short_txid}."
                )
            })

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges[:25] # Limit edges to prevent clutter
    }


def build_category_scores(rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate 0-100 scores for individual privacy categories.
    """
    reuse = rules.get("address_reuse", {})
    co_spend = rules.get("co_spending", {})
    round_amt = rules.get("round_amount", {})
    change = rules.get("possible_change", {})
    script = rules.get("script_type", {})

    reuse_score = max(0, 100 - (35 if reuse.get("detected") else 0) - min(25, (reuse.get("count", 1) - 1) * 10))
    co_spend_score = max(0, 100 - (30 if co_spend.get("detected") else 0) - min(20, (co_spend.get("count", 1) - 1) * 10))
    amount_score = max(0, 100 - (25 if round_amt.get("detected") else 0) - min(20, (round_amt.get("count", 1) - 1) * 5))
    change_score = max(0, 100 - (20 if change.get("detected") else 0) - min(20, (change.get("count", 1) - 1) * 5))
    script_score = 70 if script.get("detected") else 100

    return {
        "address_reuse": reuse_score,
        "co_spending": co_spend_score,
        "amount_patterns": amount_score,
        "change_detection": change_score,
        "script_format": script_score
    }


def build_recommendations(rules: Dict[str, Any]) -> List[Dict[str, Any]]:
    recs = []

    if rules["address_reuse"]["detected"]:
        recs.append({
            "priority": "high",
            "badge": "🔴 High Priority",
            "title": "Stop Reusing Receiving Addresses",
            "description": "Generate a new, un-used receiving address for every payment you receive to break transaction linkages."
        })

    if rules["co_spending"]["detected"]:
        recs.append({
            "priority": "high",
            "badge": "🔴 High Priority",
            "title": "Avoid Multi-Input UTXO Co-Spending",
            "description": "Use Coin Control to select individual UTXOs or execute CoinJoin transactions (Whirlpool/JoinMarket) to prevent address clustering."
        })

    if rules["round_amount"]["detected"]:
        recs.append({
            "priority": "medium",
            "badge": "🟠 Medium Priority",
            "title": "Vary Payment Amounts",
            "description": "Avoid round payment numbers (e.g., 0.1 BTC or 1,000,000 sats) that help observers distinguish payments from change outputs."
        })

    if rules["possible_change"]["detected"]:
        recs.append({
            "priority": "medium",
            "badge": "🟠 Medium Priority",
            "title": "Randomize Change Output Formats",
            "description": "Ensure your wallet creates change outputs matching varied script types or uses PayJoin (BIP78)."
        })

    if rules["script_type"]["detected"]:
        recs.append({
            "priority": "good_practice",
            "badge": "🟢 Good Practice",
            "title": "Migrate to Native SegWit / Taproot",
            "description": "Upgrade from legacy P2PKH addresses to Native SegWit (bc1q) or Taproot (bc1p) for smaller footprints and enhanced script privacy."
        })
    else:
        recs.append({
            "priority": "good_practice",
            "badge": "🟢 Good Practice",
            "title": "Maintain SegWit/Taproot Usage",
            "description": "Continue using Bech32/Bech32m address formats for optimal transaction privacy and minimal network fees."
        })

    return recs


def build_flags(rules: Dict[str, Any]) -> List[Dict[str, Any]]:
    flags = []
    rule_keys = ["address_reuse", "co_spending", "round_amount", "possible_change", "script_type"]

    for key in rule_keys:
        rule_data = rules.get(key)
        if not rule_data:
            continue

        detected = rule_data.get("detected", False)
        flags.append({
            "rule": key,
            "title": rule_data.get("title", key.replace("_", " ").title()),
            "detected": detected,
            "severity": rule_data.get("severity", "none"),
            "confidence": rule_data.get("confidence", "none"),
            "message": (
                f"{rule_data.get('title')} detected ({rule_data.get('count')} instance(s))."
                if detected
                else f"No {rule_data.get('title').lower()} detected."
            ),
            "why_detected": rule_data.get("why_detected", []),
            "evidence": rule_data.get("evidence", []),
            "details": rule_data.get("details", ""),
            "mitigation": rule_data.get("mitigation", "")
        })

    return flags


def analyze_address(address: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    rules = run_all_rules(transactions, address)

    score, score_breakdown = calculate_privacy_score(rules)
    rating = get_privacy_rating(score)
    flags = build_flags(rules)
    transaction_details = build_transaction_details(transactions, address)
    address_info = get_address_format_info(address)
    timeline = build_privacy_timeline(transactions, address)
    graph = build_relationship_graph(transactions, address)
    category_scores = build_category_scores(rules)
    recommendations = build_recommendations(rules)

    return {
        "address": address,
        "address_info": address_info,
        "transaction_count": len(transactions),
        "score": score,
        "rating": rating,
        "score_breakdown": score_breakdown,
        "category_scores": category_scores,
        "flags": flags,
        "transactions": transaction_details,
        "timeline": timeline,
        "relationship_graph": graph,
        "recommendations": recommendations,
        "summary": {
            "address_reuse": rules["address_reuse"]["count"],
            "co_spending": rules["co_spending"]["count"],
            "round_payments": rules["round_amount"]["count"],
            "possible_change_outputs": rules["possible_change"]["count"]
        },
        "analysis_note": (
            "Privacy findings are heuristic indicators based on publicly observable transaction patterns. "
            "They do not prove identity, ownership, or intent."
        )
    }