## Client state

Client state represents state data that is changable by a user via UI components but is ephemeral
and not stored on the server. We manage this state via the Zustand library.

Currently the store is one large object provided to react components via a `useStore()` hook. This
can be broken down if the state expands enough that it needs to be.
