# Taproot (BIP 340 / 341 / 342) Privacy Enhancements

## Overview
Taproot is a major soft-fork upgrade to Bitcoin introduced at block height 709,632 (November 2021).

## Key Components
1. **Schnorr Signatures (BIP 340)**: Enables signature aggregation, combining multiple keys into a single signature.
2. **Taproot (BIP 341)**: Uses MAST (Merklized Alternative Script Trees) to hide unexecuted script paths.
3. **Tapscript (BIP 342)**: Upgrades script capabilities for smart contracts.

## Privacy Impact
- Complex multi-signature or smart contract spends look identical on-chain to simple single-key transactions.
- Off-chain script branches are never revealed unless executed.
