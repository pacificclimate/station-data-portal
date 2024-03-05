## Context hooks

Context hooks represent items of data that _must_ be available before rendering can continue.

This includes the server-state config. This allows us to use the context directly in other aspects of code without having to check if it is still loading; something we can be assured of as long as we are lower in the component tree than our context provider.
