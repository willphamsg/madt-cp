# Dummy-Data Simulator

When `environment.dummy` is `true` (the default in dev), [src/app/dummyData/init-dummy-data.ts](../../src/app/dummyData/init-dummy-data.ts) (`DummyInitService`, kicked off from the layout component) **subscribes to the MADT request topics and publishes fake TC responses**, letting the whole UI run with no real backend and no real broker-side TC.

## Where the canned data lives

Payloads are organized by domain under `src/app/dummyData/`:

- `main-page.ts` — BOLC/main domain responses
- `fare.ts` — CRP/fare domain responses
- `maintenance.ts` — maintenance domain responses
- `fare-calculator.ts` — fare calculation used by the simulated fare responses

## Adding a new simulated TC behavior

1. Find (or add) the handler for the relevant `msgID` in `init-dummy-data.ts`.
2. Add or edit the canned payload in the matching `dummyData/*.ts` file.
3. The handler publishes it back on the RESPONSE topic as if the TC had answered — no changes needed outside `dummyData/` for the rest of the app to pick it up, since components only ever react to the RESPONSE topic (see [mqtt-protocol.md](mqtt-protocol.md)).

## Caveat

This simulator is dev/demo tooling, not a test double used by the Karma/Jasmine unit tests — those mock `MqttService` directly per-spec. Don't assume changes here affect `npm test`.
