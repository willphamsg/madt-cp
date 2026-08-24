# MQTT Protocol

Everything the terminal does is a request/response exchange with the backend **TC** (Transit Computer) over MQTT. [src/app/services/mqtt.service.ts](../../src/app/services/mqtt.service.ts) is the single gateway and the most important file in the codebase to understand before touching any server-driven screen.

## Config is fetched at runtime, not bundled

`connect()` GETs `/assets/mqtt-config.json` (broker host/port/credentials + the full topic map) on every connect, cache-busted. **Editing broker or topics means editing [src/assets/mqtt-config.json](../../src/assets/mqtt-config.json), not a `.ts` file.** The broker URL can also be overridden via localStorage key `mqttBrokerUrl` (used for pointing a dev build at a different broker without rebuilding).

In dev (`environment.dummy: true`), every topic is suffixed with `localDeveloperName` (set in `environment.ts`) so multiple developers share one broker without colliding. Set this to your own name/initials before running locally.

## Message envelope

Outgoing messages are built with `publishWithMessageFormat({ topic, msgID, payload, msgSubID })` and wrapped as:

```json
{ "header": { "dateTime": "...", "formatVersion": "...", "msgID": 123, "msgSubID": 1 }, "payload": { ... } }
```

-   `msgID` identifies the message type — see `MsgID` in [src/app/models/constants.ts](../../src/app/models/constants.ts). This enum is the map of every request/response pair the terminal supports; check it before assuming a message type doesn't exist.
-   `msgSubID` is REQUEST(1) / RESPONSE(2) / NOTIFY / etc. — see `MsgSubID` in the same file.
-   All publishes go out at **QoS 2** (exactly-once delivery) — this is not configurable per-call.

## Request timeout / TC-no-response

Every REQUEST starts a `DEFAULT_TIMEOUT` (5s) timer. If no matching RESPONSE arrives in that window, the `msgID` is pushed onto `isTCNoResponse$`. A matching RESPONSE (`msgSubID === RESPONSE` for the same `msgID`) clears it. The layout component watches `isTCNoResponse$` to show the disconnect/no-response overlay — if you add a new REQUEST/RESPONSE pair, this behavior is automatic as long as you use `publishWithMessageFormat` and the matching `msgID` on the response.

## Multi-handler topics

`subscribe({ topic, callback, topicKey })` lets several components subscribe to the same topic concurrently; `topicKey` namespaces handlers so `unsubscribe` removes only one. **Always pass a stable, unique `topicKey` and call `unsubscribe` in `ngOnDestroy`** — forgetting this leaks handlers that fire after the component is gone (a component that navigates away and back will otherwise accumulate duplicate handlers on the same topic).

## Validation and logging

Every inbound/outbound message is run through `validateMessageFormat`; failures emit on `messageFormatError$` rather than throwing. All traffic (valid or not) is mirrored to `mqttLog$` as CSV rows, which feeds the live log on the [`/mqtt` diagnostics screen](../../src/app/views/mqtt/mqtt.component.ts).

## Reacting to connection lifecycle

Prefer these observables over touching the underlying MQTT client directly:

| Observable            | Fires when                                                          |
| --------------------- | ------------------------------------------------------------------- |
| `connectionStatus$`   | Broker connection state changes                                     |
| `mqttConfigLoaded$`   | `mqtt-config.json` has been fetched and applied                     |
| `isReconnect$`        | The client is attempting a reconnect                                |
| `isTCNoResponse$`     | One or more in-flight `msgID`s have timed out waiting on a RESPONSE |
| `messageFormatError$` | A message failed `validateMessageFormat`                            |
| `mqttLog$`            | Any message published or received (CSV row)                         |

## Adding a new server-driven screen

1. Add the `msgID`/`msgSubID` to `models/constants.ts` if it doesn't exist.
2. Subscribe to the response topic in the component (or a service) with a stable `topicKey`.
3. On RESPONSE, dispatch an NgRx action into the relevant slice (see [state-management.md](state-management.md)).
4. Select the slice in the component template.
5. If you need this to work without a live TC, add a handler in the dummy-data simulator (see [dummy-data-simulator.md](dummy-data-simulator.md)).
