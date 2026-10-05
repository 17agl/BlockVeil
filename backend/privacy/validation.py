import re

# Regex patterns for sensitive key/seed detection
MNEMONIC_PATTERN = re.compile(r"^([a-zA-Z]+\s+){11,23}[a-zA-Z]+$")
WIF_PATTERN = re.compile(r"^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$")
HEX_PRIVKEY_PATTERN = re.compile(r"^[0-9a-fA-F]{64}$")
NOSTR_NSEC_PATTERN = re.compile(r"^nsec1[a-z0-9]{58}$")

# Regex for public Bitcoin address formats
BTC_ADDRESS_PATTERN = re.compile(
    r"^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|"  # P2PKH Mainnet
    r"3[a-km-zA-HJ-NP-Z1-9]{25,34}|"  # P2SH Mainnet
    r"bc1[0-9a-zA-Z]{8,87}|"          # Bech32/Bech32m (SegWit/Taproot) Mainnet
    r"[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}|" # Testnet legacy/P2SH
    r"tb1[0-9a-zA-Z]{8,87})$",         # Testnet Bech32
    re.IGNORECASE
)


def validate_input_security(user_input: str) -> None:
    """
    Check if user input contains sensitive key material or seed phrases.
    Raises ValueError with a security alert if sensitive material is detected.
    """
    cleaned = user_input.strip()

    if MNEMONIC_PATTERN.match(cleaned):
        raise ValueError(
            "SECURITY ALERT: Input looks like a seed phrase (mnemonic words)! "
            "Never share seed phrases with any application."
        )

    if WIF_PATTERN.match(cleaned) or HEX_PRIVKEY_PATTERN.match(cleaned):
        raise ValueError(
            "SECURITY ALERT: Input looks like a Bitcoin private key (WIF/Hex)! "
            "Never share private keys."
        )

    if NOSTR_NSEC_PATTERN.match(cleaned) or cleaned.startswith("nsec"):
        raise ValueError(
            "SECURITY ALERT: Input looks like a Nostr private key (nsec)! "
            "Never share private keys."
        )


def is_valid_bitcoin_address_syntax(address: str) -> bool:
    """
    Syntactically check if a string is a valid Bitcoin public address format.
    """
    cleaned = address.strip()
    return bool(BTC_ADDRESS_PATTERN.match(cleaned))
