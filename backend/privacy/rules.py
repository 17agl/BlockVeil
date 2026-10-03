def check_address_reuse(transactions, address):
    """
    Checks whether the supplied address appears
    in multiple transaction inputs or outputs.
    """

    appearances = 0

    for tx in transactions:
        for vin in tx.get("vin", []):
            prevout = vin.get("prevout") or {}

            if prevout.get("scriptpubkey_address") == address:
                appearances += 1

        for vout in tx.get("vout", []):
            if vout.get("scriptpubkey_address") == address:
                appearances += 1

    detected = appearances > 1

    return {
        "rule": "address_reuse",
        "detected": detected,
        "severity": "high" if detected else "none",
        "message": (
            f"This address appears {appearances} times."
            if detected
            else "No repeated address usage was detected."
        ),
        "details": {
            "appearances": appearances
        }
    }


def check_round_number_payments(transactions):
    """
    Looks for BTC outputs that are exact round-number
    amounts such as 0.1, 0.5, 1.0 BTC.

    This is a heuristic, not proof of payment intent.
    """

    round_values = {
        0.01,
        0.05,
        0.1,
        0.2,
        0.5,
        1.0,
        2.0,
        5.0,
        10.0
    }

    detected_outputs = []

    for tx in transactions:
        for vout in tx.get("vout", []):
            value_sats = vout.get("value", 0)
            value_btc = value_sats / 100_000_000

            if value_btc in round_values:
                detected_outputs.append({
                    "txid": tx.get("txid"),
                    "amount_btc": value_btc
                })

    detected = len(detected_outputs) > 0

    return {
        "rule": "round_number_payment",
        "detected": detected,
        "severity": "medium" if detected else "none",
        "message": (
            f"{len(detected_outputs)} round-number output(s) detected."
            if detected
            else "No obvious round-number payments detected."
        ),
        "details": {
            "outputs": detected_outputs
        }
    }


def check_change_output(transactions, address):
    """
    Basic heuristic for possible change outputs.

    This does NOT claim to identify the actual change address.
    """

    candidates = []

    for tx in transactions:

        outputs = tx.get("vout", [])

        if len(outputs) < 2:
            continue

        values = [
            output.get("value", 0)
            for output in outputs
        ]

        smallest = min(values)
        largest = max(values)

        if largest > 0 and smallest / largest < 0.1:
            candidates.append({
                "txid": tx.get("txid"),
                "smallest_output": smallest,
                "largest_output": largest
            })

    detected = len(candidates) > 0

    return {
        "rule": "possible_change_output",
        "detected": detected,
        "severity": "medium" if detected else "none",
        "message": (
            "Some transactions contain an output pattern "
            "that could be consistent with change."
            if detected
            else "No obvious change-output pattern detected."
        ),
        "details": {
            "candidates": candidates
        }
    }