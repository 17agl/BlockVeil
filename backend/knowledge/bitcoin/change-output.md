# Bitcoin Change Output

When a Bitcoin transaction spends a UTXO, the entire selected
UTXO is normally consumed.

If the user wants to send less than the value of the selected
UTXO, another output can return the remaining value to an address
controlled by the sender.

This output is commonly called a change output.

Example:

Input:
1.0 BTC

Payment:
0.6 BTC

Possible change:
0.39 BTC

The remaining 0.01 BTC could be the transaction fee.

Identifying change from blockchain data is often heuristic.
A transaction structure alone does not prove which output is
change.