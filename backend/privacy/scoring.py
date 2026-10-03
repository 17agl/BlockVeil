def calculate_score(flags):

    score = 100

    deductions = {
        "address_reuse": 35,
        "round_number_payment": 15,
        "possible_change_output": 20
    }

    for flag in flags:

        if flag["detected"]:
            score -= deductions.get(flag["rule"], 0)

    score = max(0, score)

    if score >= 80:
        rating = "Good"
    elif score >= 50:
        rating = "Needs Improvement"
    else:
        rating = "Poor"

    return score, rating