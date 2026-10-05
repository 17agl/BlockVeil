# Lightning Network and Off-Chain Privacy

## Overview
The Lightning Network is a Layer 2 scaling protocol built on top of Bitcoin using bidirectional payment channels.

## How Lightning Enhances Privacy
- **Off-Chain Payments**: Individual Lightning transactions are not recorded on the public Bitcoin blockchain ledger.
- **Onion Routing**: Payments pass through intermediate nodes using Sphinx onion routing, hiding source and final destination node identities from intermediate hops.

## On-Chain / Off-Chain Boundary
Only channel opening (funding TX) and channel closing (cooperative/unilateral settlement TX) touch the mainchain.
