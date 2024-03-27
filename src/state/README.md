# State.

## Philosophy:

The app is divided into multiple layers these are:

### Layer 1: fetching (see [query-hooks](./query-hooks/README.md))

This is the layer that talks to the server. Its responsibilities are the ajax calls to retrieve data and basic operations to manipulate the data into a UI usable format (such as parsing dates).

This layer is generally fairly simple and is colocated inside the query-hooks files.

### Layer 2: caching, async management (see [query-hooks](./query-hooks/README.md))

Manages async states. Caches data returned from promises. Manages cache keys and whether data is stale. As we're using react-query for this layer it also provides various re-try, reconnect and refocus stale retrieval.

Async promises for data retreval are provided by Layer 1.

### Layer 3: business logic (see [client-server-hooks](./client-server-hooks/README.md), [context-hooks](./context-hooks/README.md), [client](./client/README.md))

Manages how returned server data should effect client state. For client-server-hooks this takes the form of (generally) updating client state defaults.

For context-hooks this allows us to make sure that server state is loaded before components render rarther than prop-drilling. So far this is only applicable to the config which is required throughout the app.

This layer also contains the client state. The client state is ephemeral (will be lost on reload) and supports how the UI wants to present data retrieved from the server ie filtering, state of user driven components.

### Layer 4: presentation ([react components](../components/README.md))

Manages how state is presented to the user. This is the UI itself as well as how different aspects of state are triggered (by virtue of the component tree).

Can use Layer 2 directly if it doesn't need any special data manipulation.

Otherwise uses Layer 3 stores (client, hooks) to present and manipulate data back up the tree.
