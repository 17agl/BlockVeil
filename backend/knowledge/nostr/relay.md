# Nostr Relay

A Nostr relay is a server that accepts, stores, and distributes
Nostr events.

Nostr clients can connect to one or more relays.

Relays are generally independent from one another.

A user may publish an event to multiple relays so that different
clients can retrieve it.

A relay does not necessarily represent the identity or authority
of the person using it.

Nostr's architecture allows users to choose which relays their
clients interact with.