# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

LTA MADT GUI (`lta-madt-gui`) — the Angular front-end for a bus **Multi-Application Display Terminal**. It is a touchscreen onboard a public bus that talks to a backend **TC** (Transit Computer) over **MQTT**. The terminal exposes three operational domains, each a top-level routed area with its own NgRx slice, MQTT topic family, and layout:

- **main** (BOLC — Bus Operator's) — boot-up/commissioning, login, start/end trip, bus-stop info, doors, cash payment, redeem.
- **fare** (CRP) — ticketing, transactions, cancel ride, concession, top-up, BLS/CV/printer operation.
- **maintenance** — CJB, fare maintenance, audit registers, menu/log-off.

## Commands

```bash
npm start                     # ng serve → http://localhost:4200
npm run start:local:network   # ng serve on 0.0.0.0 (test from the physical terminal / LAN)
npm run build                 # ng build --aot --output-hashing=all, output to dist/
npm test                      # ng test, ChromeHeadless (auto-detects chromium/chrome via CHROME_BIN)
npm run test:coverage         # same, plus --code-coverage --watch=false
npm run lint:check            # eslint + prettier --check (run before pushing)
npm run lint:fix              # eslint --fix + prettier --write
```

Run a single spec: `npx ng test --include='**/start-trip.component.spec.ts' --watch=false`

Node is pinned to **v20.11.1** (`.nvmrc`); use `nvm use`. Husky + lint-staged run eslint/prettier on staged files at commit time.

## Build configurations

`angular.json` defines three environments via file replacement of `src/environments/environment.ts`:
- `environment.ts` (dev) — `env: 'dev'`, `dummy: true`. In dev, all MQTT topics are **suffixed with `localDeveloperName`** (e.g. `WILL`) so multiple developers share one broker without colliding. Change `localDeveloperName` to your own.
- `environment.uat.ts`, `environment.prod.ts`.

`dummy: true` activates the dummy-data simulator (see below). `displayAutoClick` and `clickInterval` drive an automated UI walkthrough used for demos/testing.

## Architecture

### MQTT is the application's spine

Everything the terminal does is a request/response exchange with the TC over MQTT. [src/app/services/mqtt.service.ts](src/app/services/mqtt.service.ts) is the single gateway and is the most important file to understand.

- **Config is fetched at runtime**, not bundled: `connect()` GETs `/assets/mqtt-config.json` (broker host/port/credentials + the full topic map) on every connect, cache-busted. Editing broker or topics means editing [src/assets/mqtt-config.json](src/assets/mqtt-config.json), not a `.ts` file. The broker URL can also be overridden via localStorage key `mqttBrokerUrl`.
- **Message envelope**: outgoing messages built by `publishWithMessageFormat({ topic, msgID, payload, msgSubID })` are wrapped as `{ header: { dateTime, formatVersion, msgID, msgSubID }, payload }`. `msgID` identifies the message type (`MsgID` in [models/constants.ts](src/app/models/constants.ts)); `msgSubID` is REQUEST(1)/RESPONSE(2)/etc. (`MsgSubID`). Published at **QoS 2**.
- **Request timeout / TC-no-response**: each REQUEST starts a `DEFAULT_TIMEOUT` (5s) timer; if no matching RESPONSE arrives, the `msgID` is pushed onto `isTCNoResponse$`. A matching RESPONSE (`msgSubID === RESPONSE`) clears it. The layout watches this to show the disconnect/no-response UI.
- **Multi-handler topics**: `subscribe({ topic, callback, topicKey })` lets several components subscribe to the same topic; `topicKey` namespaces handlers so `unsubscribe` removes only one. Always pass a stable `topicKey` and unsubscribe in `ngOnDestroy`.
- **Validation + logging**: every message is run through `validateMessageFormat`; failures emit on `messageFormatError$`. All traffic is mirrored to `mqttLog$` as CSV rows.
- Observables exposed by the service (`connectionStatus$`, `mqttConfigLoaded$`, `isReconnect$`, `isTCNoResponse$`, `messageFormatError$`, `mqttLog$`) are how the rest of the app reacts to connection lifecycle — prefer these over poking the client.

### State — NgRx, one slice per domain

[src/app/store/app.state.ts](src/app/store/app.state.ts) composes four feature reducers: `main`, `maintenance`, `fare`, `global`. `global` holds cross-cutting state (connection status, location/positioning mode, global errors). MQTT RESPONSE handlers dispatch actions into the relevant slice; components `store.select(...)` to render. When adding a server-driven screen, the flow is: subscribe to the response topic → dispatch into the slice → select in the component.

### Dummy-data simulator

When `environment.dummy` is true, [src/app/dummyData/init-dummy-data.ts](src/app/dummyData/init-dummy-data.ts) (`DummyInitService`, kicked off from the layout) **subscribes to the MADT request topics and publishes fake TC responses**, letting the whole UI run with no real backend. Canned payloads live in `src/app/dummyData/*` (`main-page.ts`, `fare.ts`, `maintenance.ts`, etc.). To simulate a new TC behavior, add a handler here.

### Routing

[src/app/app.routes.ts](src/app/app.routes.ts) defines `routerUrls` (the full path tree for public + the three private domains) and a `nestedUrlHandler(url, textToRemove)` helper right in that file, then builds the `Routes` array from them instead of hard-coded path strings — nested/child routes call `nestedUrlHandler` against their parent's URL. Public routes (`sign-in`, `welcome`, `mqtt`) sit outside the authenticated shell; the three domains (`main`, `fare`, `maintenance`, plus `fms`) are nested children under `routerUrls.private`. An `AuthGuard` on the private shell route is currently commented out (`// canActivate: [AuthGuard]`) — check current state before assuming route-level auth is enforced. The `mqtt` route ([views/mqtt](src/app/views/mqtt/mqtt.component.ts)) is a developer/diagnostics screen for broker config and the live message log.

### Components are standalone

This is a modern Angular (v21) **standalone-component** app — no NgModules. Bootstrap is `bootstrapApplication(AppComponent, appConfig)` in [main.ts](src/main.ts); providers (router, NgRx store, ngx-translate, animations, hydration) are in [app.config.ts](src/app/app.config.ts). Each component declares its own `imports`.

### Path aliases

Import via tsconfig aliases, not relative paths: `@app/*`, `@models` / `@models/*`, `@components/*`, `@views/*`, `@store/*`, `@services/*`, `@directives/*`, `@data/*`, `@dummyData/*`, `@env/*`, `@styles/*`, `@assets/*`.

### i18n

ngx-translate, JSON catalogs at `src/assets/i18n/` (`en.json`, `ch.json`), default `en`. User-facing strings go through `translate`; add keys to both catalogs.

## Conventions

- TypeScript `strict` is on, plus Angular `strictTemplates`. Note `noImplicitAny: false` — but don't lean on it.
- Imports are auto-sorted by `eslint-plugin-simple-import-sort`; let `lint:fix` order them.
- SSR scaffolding exists ([server.ts](server.ts), `main.server.ts`, `@angular/ssr`) but the terminal runs as a client app; `provideClientHydration()` is configured.

## SSR (rarely used)

```bash
npm run build && npm run serve:ssr:lta-btds-gui   # node dist/lta-btds-gui/server/server.mjs
```
