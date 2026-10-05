# Round Amount Payment Heuristics

## Overview
Human payment senders frequently select round decimal payment values (such as 0.1 BTC, 0.05 BTC, or 1,000,000 satoshis).

## How Heuristic Analysis Identifies Payment vs Change
In a standard two-output Bitcoin transaction:
1. One output represents the payment sent to the merchant or recipient.
2. The second output represents the change returned to the sender's wallet.

When a payment amount is a round number (e.g. 0.10 BTC) and the second output is a non-round decimal (e.g. 0.03481290 BTC), external observers infer that:
- The round output (0.10 BTC) is the payment destination.
- The non-round output (0.03481290 BTC) is the change output.

## Privacy Mitigation
- Avoid round payment amounts when privacy is desired.
- Use PayJoin (BIP78) to break the assumption that outputs must separate into payment and change.
