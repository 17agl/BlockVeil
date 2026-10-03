from .rules import (
    check_address_reuse,
    check_round_number_payments,
    check_change_output
)

from .scoring import calculate_score


def analyze_address(address, transactions):

    flags = []

    flags.append(
        check_address_reuse(
            transactions,
            address
        )
    )

    flags.append(
        check_round_number_payments(
            transactions
        )
    )

    flags.append(
        check_change_output(
            transactions,
            address
        )
    )

    score, rating = calculate_score(flags)

    return {
        "address": address,
        "transaction_count": len(transactions),
        "score": score,
        "rating": rating,
        "flags": flags
    }