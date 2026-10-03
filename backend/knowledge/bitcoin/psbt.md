# PSBT

PSBT stands for Partially Signed Bitcoin Transaction.

A PSBT is a standardized format for exchanging information
about a Bitcoin transaction that may require one or more
signatures.

A PSBT can contain transaction information and additional
metadata required for signing.

It allows transaction construction and signing to be separated.

For example, one device can construct a transaction while
another device or hardware wallet signs it.

A PSBT does not itself mean that Bitcoin has been transferred.
The transaction still needs to be properly finalized and
broadcast to the Bitcoin network.