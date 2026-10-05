# CoinJoin and PayJoin Privacy Protocols

## What is CoinJoin?
CoinJoin is a trustless privacy protocol where multiple participants combine their UTXOs into a single, multi-input multi-output transaction.

## Privacy Benefits
- **Equal Output Sizes**: Standardized output values (e.g. 0.05 BTC each) break input-output deterministic mapping.
- **Obfuscates Heuristics**: Destroys the Common Input Ownership Heuristic (CIOH) by mixing multiple unrelated owners into one transaction.

## PayJoin (BIP 78)
PayJoin (P2EP - Pay-to-End-Point) is a 2-party transaction protocol where both sender and merchant contribute UTXOs to a payment transaction, breaking standard change output analysis.
