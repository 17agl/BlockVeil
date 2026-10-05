# Multi-Input Co-Spending & Common Input Ownership Heuristic (CIOH)

## Overview
When a Bitcoin transaction contains inputs from multiple distinct addresses, blockchain analysis tools assume that all input addresses belong to the same entity or wallet. This pattern is known as the **Common Input Ownership Heuristic (CIOH)**.

## Privacy Impact
- **UTXO Clustering**: Co-spending links previously unassociated Unspent Transaction Outputs (UTXOs) together.
- **Identity Merging**: If one of the co-spent addresses is linked to a user's real-world identity (e.g. through an exchange KYC process), all other co-spent addresses become linked to that same identity.
- **Balance Exposure**: Observers can calculate the total combined balance of the user's wallet across all linked addresses.

## How to Mitigate Co-Spending Linkage
- **Coin Control**: Select single UTXOs manually for payments when possible.
- **CoinJoin Protocols**: Use privacy-preserving protocols such as JoinMarket or Whirlpool to mix inputs with other users before spending.
