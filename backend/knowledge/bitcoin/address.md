# Bitcoin Address Formats & Privacy Implications

## Overview
A Bitcoin address is an encoded alphanumeric identifier representing a destination for Bitcoin payments.

## Address Types & Formats
1. **Legacy (P2PKH - Pay-to-PubKey-Hash)**:
   - Starts with `1` (Mainnet) or `m`/`n` (Testnet).
   - Base58Check encoding.
   - Highest fees, largest signature size, distinct fingerprint.
2. **Nested SegWit (P2SH - Pay-to-Script-Hash)**:
   - Starts with `3` (Mainnet) or `2` (Testnet).
   - Allows SegWit compatibility inside legacy P2SH script hashes.
3. **Native SegWit (P2WPKH - Pay-to-Witness-PubKey-Hash)**:
   - Starts with `bc1q` (Mainnet) or `tb1q` (Testnet).
   - Bech32 encoding. Lower transaction fees, smaller footprint.
4. **Taproot (P2TR - Pay-to-Taproot)**:
   - Starts with `bc1p` (Mainnet) or `tb1p` (Testnet).
   - Bech32m encoding. Uses Schnorr signatures (BIP 340).
   - Hides complex script conditions under key-path spend, making smart contract spending indistinguishable from single-key spending.
