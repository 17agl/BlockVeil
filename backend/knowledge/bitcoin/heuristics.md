# Blockchain Privacy Heuristics and False Positives

## What are Privacy Heuristics?
Privacy heuristics are rule-based probabilistic indicators used to analyze public blockchain transaction graphs. Common heuristics include:
- Address Reuse Detection
- Common Input Ownership Heuristic (CIOH)
- Change Output Identification
- Round Payment Pattern Recognition

## Important Limitations & False Positives
1. **No Proof of Identity**: Heuristics observe transaction metadata on a public blockchain. They **never** prove identity, legal ownership, or personal intent.
2. **False Positives**:
   - A multi-input transaction might be a CoinJoin or PayJoin rather than a single entity wallet co-spend.
   - An output matching input address might be an exchange batching payout rather than personal change.
   - A round payment amount could be coincidental.

## Privacy Scores
Privacy scores provide a relative, heuristic-based indicator for educational assessment. A low privacy score indicates observable transaction patterns that increase traceability, while a high score indicates fewer public transaction signals.
