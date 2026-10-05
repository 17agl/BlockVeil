"""
Privacy Scoring Engine

100 = No configured privacy vulnerability signals detected
0   = Severe multiple privacy vulnerabilities detected

Provides granular deduction breakdown and clear privacy ratings.
"""

from typing import Dict, Any, Tuple, List


def calculate_privacy_score(rules: Dict[str, Any]) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Calculate overall privacy score (0-100) and return itemized deduction breakdown.
    """
    score = 100
    deductions = []

    # 1. Address Reuse Penalty
    reuse_rule = rules.get("address_reuse", {})
    if reuse_rule.get("detected"):
        base_deduction = 30
        extra = min(15, (reuse_rule.get("count", 1) - 1) * 5)
        total_deduction = base_deduction + extra
        score -= total_deduction
        deductions.append({
            "rule": "address_reuse",
            "title": "Address Reuse",
            "points": total_deduction,
            "reason": f"Address reused in {reuse_rule.get('count')} receiving transactions."
        })

    # 2. Multi-Input Co-Spending Penalty (CIOH)
    co_spend_rule = rules.get("co_spending", {})
    if co_spend_rule.get("detected"):
        base_deduction = 25
        extra = min(15, (co_spend_rule.get("count", 1) - 1) * 5)
        total_deduction = base_deduction + extra
        score -= total_deduction
        deductions.append({
            "rule": "co_spending",
            "title": "Multi-Input Co-Spending",
            "points": total_deduction,
            "reason": f"UTXOs co-spent alongside other input addresses in {co_spend_rule.get('count')} transaction(s)."
        })

    # 3. Round Amount Penalty
    round_rule = rules.get("round_amount", {})
    if round_rule.get("detected"):
        base_deduction = 15
        extra = min(10, (round_rule.get("count", 1) - 1) * 5)
        total_deduction = base_deduction + extra
        score -= total_deduction
        deductions.append({
            "rule": "round_amount",
            "title": "Round Amount Payment",
            "points": total_deduction,
            "reason": f"Detected {round_rule.get('count')} round-number payment amount(s)."
        })

    # 4. Change Output Heuristic Penalty
    change_rule = rules.get("possible_change", {})
    if change_rule.get("detected"):
        base_deduction = 15
        extra = min(10, (change_rule.get("count", 1) - 1) * 5)
        total_deduction = base_deduction + extra
        score -= total_deduction
        deductions.append({
            "rule": "possible_change",
            "title": "Possible Change Pattern",
            "points": total_deduction,
            "reason": f"Detected {change_rule.get('count')} candidate change-output heuristic pattern(s)."
        })

    # 5. Legacy Script Format Penalty
    script_rule = rules.get("script_type", {})
    if script_rule.get("detected"):
        total_deduction = 5
        score -= total_deduction
        deductions.append({
            "rule": "script_type",
            "title": "Legacy Script Format",
            "points": total_deduction,
            "reason": "Address uses legacy P2PKH format which lacks modern SegWit/Taproot privacy optimization."
        })

    final_score = max(0, score)
    return final_score, deductions


def get_privacy_rating(score: int) -> str:
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 50:
        return "Needs Improvement"
    else:
        return "Poor"