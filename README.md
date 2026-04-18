# Renewcomb Router for React

### Observations

Features

- supports relative urls with `./` and `../`
- unprefixed urls assume `/` root not `./` current as it is the most common case
- no magic "router outlet"; routed components appear as the children of the router component
- lazy-loading components
- synchronous unless lazy-loading, for better animations
- `goto` function is outside of React ecosystem
- no hooks; url parameters and dataloads are passed to the component via props
- 150 lines of code only, including typescript interfaces
- set a Loading component globally plus override with a per-route skeleton instead
- pass arbitrary data through `goto` function
- route guard `if` and matching `else` function
- if lazy-loading modules with a default export, no need to specify the component name
- route config errors are explicit and appear obviously; no need to dig around in console.log with blank screens
- no useEffect!

#### TODO

Nested routers. Nested routes.

Test animations.

delay Loading display for a tick in case remote data is in an async cache

### Discarded Features

Can't just have the `component:` be a string for dynamic `import()` because the bundler cannot fix the path.

Also, routes definition just being a key-value object was messier than expected when using deep routes with parameters. Too much punctuation.

### Break it out into pieces

1. the url reader and changer, the `goto` function. Relative goto.
1. the tabset-without-tabstrip.
1. the component loader, data loader, and promise problems
1. the isloading screen for unresolved promise phase.
1. the animation interstitial phase.
1. the route config that connects URL to Component , whose `goto` changes "tab"
1. the exiting tab panel to be kept until animation finishes.
1. the router config is always partial; parts are lazy-loaded and added at runtime

When the `goto` aims to a level deeper than the router config... there's another router?

When gotoing a path with ?query params but the same path we're already on, do we still nav? I guess so....
