# State Management (NgRx)

[src/app/store/app.state.ts](../../src/app/store/app.state.ts) composes four feature reducers, one per operational domain plus one cross-cutting slice:

| Slice | Covers |
|---|---|
| `main` | BOLC — boot-up/commissioning, login, start/end trip, bus-stop info, doors, cash payment, redeem |
| `fare` | CRP — ticketing, transactions, cancel ride, concession, top-up, BLS/CV/printer operation |
| `maintenance` | CJB, fare maintenance, audit registers, menu/log-off |
| `global` | Cross-cutting: connection status, location/positioning mode, global errors |

Each slice has its own `*.actions.ts`, `*.reducer.ts`, and selectors under `src/app/store/<domain>/`.

## Data flow

State is server-driven, not user-driven. The flow for any screen backed by the TC is:

```
MQTT RESPONSE arrives → handler dispatches an action into the relevant slice → component does store.select(...) to render
```

There is no client-side optimistic update pattern here — components generally don't dispatch actions to mutate state directly in response to user clicks; they publish an MQTT REQUEST and wait for the RESPONSE handler to dispatch. Exceptions exist for purely local UI state (e.g. which step of a multi-step screen is showing), which is often plain component `@Input`/class-field state, not NgRx.

## Adding state for a new screen

1. If the new screen belongs to an existing domain (`main`/`fare`/`maintenance`), add action(s) and a reducer case to that domain's existing files rather than creating a new slice.
2. Only add to `global` if the state is genuinely cross-domain (e.g. affects the layout/connection banner regardless of which tab is active).
3. Wire the dispatch into the MQTT RESPONSE handler for the corresponding `msgID` (see [mqtt-protocol.md](mqtt-protocol.md)).
