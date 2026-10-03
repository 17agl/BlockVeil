# nsec

An nsec is a bech32-encoded representation of a Nostr private key.

The private key is used to cryptographically sign Nostr events.

An nsec should be treated as secret.

Users should never give their nsec to an AI assistant, website,
relay, or another person.

If someone obtains a private key, they may be able to create
valid signatures for that Nostr identity.