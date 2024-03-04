## Client state

Client state represents state data that is changable by a user via UI components but is ephemeral
and not stored on the server. We manage this state via the Zustand library.

There are two stores, one holds information specific to station filtering for the map, provided to
react components via a `useStationsStore()` hook. Because of the complexity of this area and the
potential needs for using transitions it was speperated out.

The other store (`useStore()`) holds other global state information. This is currently small as
server state objects have been removed off into react query hooks. See
[query hooks](../query-hooks/README.md) for more details.
