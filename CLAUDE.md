# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. It is a high-level index — deep technical detail lives in [.claude/docs/](.claude/docs/) and is linked from the relevant section below.

## 1. Project Overview

LTA MADT GUI (`lta-madt-gui`) is the Angular front-end for a bus **Multi-Application Display Terminal**: a touchscreen mounted on a public bus that talks to a backend **TC** (Transit Computer) over MQTT. It covers three operational domains — **main** (bus operator: login, start/end trip, doors, cash payment), **fare** (ticketing, top-up, concession, printer/BLS/CV operation), and **maintenance** (fare console config, audit registers, device diagnostics) — each a top-level routed area with its own NgRx slice and MQTT topic family.

## 2. Tech Stack

- **Angular 21** (standalone components, no NgModules) — `@angular/core`, `@angular/cdk`, `@angular/material`, `@angular/ssr`
- **NgRx 21** (`@ngrx/store`) for state
- **TypeScript ~5.9**, `strict` mode + Angular `strictTemplates`
- **RxJS ~7.8**
- **MQTT.js 5.x** (`mqtt`) for the broker connection; `@types/mqtt`
- **ngx-translate 17** for i18n
- **ngx-scrollbar** for custom scroll UI
- **Karma + Jasmine** for unit tests (ChromeHeadless)
- **ESLint 9 (flat config) + Prettier 3.2** for lint/format
- **Node v20.11.1** (pinned via `.nvmrc`)

## 3. Dev Commands

```bash
nvm use                       # switch to the pinned Node version — do this first
npm install                   # install dependencies
npm start                     # ng serve → http://localhost:4200
npm run start:local:network   # ng serve on 0.0.0.0 (test from the physical terminal / LAN)
npm run build                 # ng build --aot --output-hashing=all, output to dist/
npm test                      # ng test, ChromeHeadless (auto-detects chromium/chrome via CHROME_BIN)
npm run lint:check            # eslint + prettier --check — run before pushing
npm run lint:fix              # eslint --fix + prettier --write
```

Run a single spec: `npx ng test --include='**/start-trip.component.spec.ts' --watch=false`

Before running locally: open `src/environments/environment.ts` and set `localDeveloperName` to your own name/initials (MQTT topics are suffixed with it in dev so multiple developers share one broker without colliding).

## 4. Core Logic Summary

This app has no standalone "calculation engine" — its core logic is the **MQTT request/response protocol** that drives every screen: a component publishes a REQUEST with a `msgID`, the TC (or, in dev, the dummy-data simulator) answers on the matching topic with a RESPONSE carrying the same `msgID`, and an NgRx action derived from that RESPONSE updates the relevant store slice, which the component renders. Screens don't mutate their own state from a click handler; they wait on this round trip. The one piece of actual arithmetic in the codebase is fare computation in `src/app/dummyData/fare-calculator.ts`, used by the dev simulator to produce realistic fare responses.

Full protocol details (message envelope, timeouts, topic subscription rules): **[.claude/docs/mqtt-protocol.md](.claude/docs/mqtt-protocol.md)**
State flow built on top of it: **[.claude/docs/state-management.md](.claude/docs/state-management.md)**

## 5. Key Constraints

- **Every issue/feature change must update unit tests and pass SonarQube in the same change — not as follow-up work.** Add or update specs for any new/changed behavior before considering the change done; run `npm run lint:check` and check SonarQube findings on the diff, and resolve them (or, per the sonar-fix-issue skill, mark as a documented false positive) before merging.
- **Never hardcode broker host/port/credentials or topic names in `.ts` files.** They are fetched at runtime from `src/assets/mqtt-config.json`; edit that file, not the service.
- **Never assume `AuthGuard` is enforced on the private routes.** It is currently commented out in `app.routes.ts` (`// canActivate: [AuthGuard]`) — check the live state of that line before relying on it or removing checks that assume it's active.
- **Never add a user-facing string without a translation key in both `en.json` and `ch.json`.** No hardcoded English text in templates.
- **Never publish an MQTT message without going through `publishWithMessageFormat`.** It supplies the required envelope (`header`, `msgID`, `msgSubID`) and QoS 2 — hand-built payloads will fail `validateMessageFormat` on the other end.
- **Never forget `topicKey` + `unsubscribe` on MQTT subscriptions.** Omitting either leaks a handler that keeps firing after the component is destroyed.
- **Every issue/feature change must be checked for memory leaks before considering it done.** Verify every RxJS subscription, MQTT topic subscription, and `setInterval`/`setTimeout` added or touched has a matching teardown in `ngOnDestroy` (`takeUntil(this.destroy$)`, `unsubscribe()`, `clearInterval`/`clearTimeout`). This matters more here than in a typical web app — the terminal runs for an entire bus shift without a page reload, so a leaked subscription accumulates for hours instead of being wiped out by the next navigation.
- **Don't treat the dummy-data simulator as a source of truth for real TC behavior.** It's dev/demo tooling (`environment.dummy: true`), not a spec of the actual protocol — when in doubt, check `models/constants.ts` and the real message flow, not just what the simulator returns.
- **Don't bypass Husky/lint-staged with `--no-verify`.** Fix the lint/format failure instead.
- **Don't introduce relative imports across feature folders.** Use the tsconfig path aliases (`@services/*`, `@components/*`, etc.).

## 6. Additional Documentation

- **[.claude/docs/mqtt-protocol.md](.claude/docs/mqtt-protocol.md)** — the MQTT service, message envelope, timeout/reconnect behavior, and how to wire up a new server-driven screen.
- **[.claude/docs/state-management.md](.claude/docs/state-management.md)** — NgRx store slices and the RESPONSE-to-render data flow.
- **[.claude/docs/architecture.md](.claude/docs/architecture.md)** — standalone components, routing conventions, path aliases, build/environment configs, i18n, SSR, lint conventions.
- **[.claude/docs/dummy-data-simulator.md](.claude/docs/dummy-data-simulator.md)** — how the no-backend dev simulator works and how to extend it.
