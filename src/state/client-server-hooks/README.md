## Client-Server hooks

Client-Server hooks are custom hooks that are a bridge between the client side state (Zustand) and the react-query server state.
These are generally once per load functions that apply default values into our Zustand store.

For example. When the preview screen loads we need to calculate the valid user selecable range as well as the default selected range for the data available. This is calculated after the station variable data loads (detected by a change in data in a useEffect hook) and applied onto the store.
