# UTXO

UTXO stands for Unspent Transaction Output.

Bitcoin does not represent a wallet balance as one simple
number stored on the blockchain. Instead, spendable Bitcoin
is represented by transaction outputs that have not yet been
spent.

A UTXO can be thought of as a piece of Bitcoin that is available
to be used as an input in a future transaction.

When a Bitcoin transaction spends a UTXO, that UTXO becomes
spent and cannot normally be spent again.

The transaction creates new outputs. Those outputs can become
new UTXOs when they remain unspent.

Example:

Alice receives 0.5 BTC.

That transaction creates an output worth 0.5 BTC.

If Alice has not spent that output yet, it is a UTXO.

When Alice spends it, the old UTXO is consumed and new outputs
are created.