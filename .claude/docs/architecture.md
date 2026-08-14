# Architecture

## Standalone components, no NgModules

Angular v21, **standalone-component** app throughout. Bootstrap is `bootstrapApplication(AppComponent, appConfig)` in [src/main.ts](../../src/main.ts); providers (router, NgRx store, ngx-translate, animations, hydration) are configured in [src/app/app.config.ts](../../src/app/app.config.ts). Each component declares its own `imports` array — there is no shared module to add a component to.

## Routing

[src/app/app.routes.ts](../../src/app/app.routes.ts) defines `routerUrls` (the full path tree for public + the three private domains) and a `nestedUrlHandler(url, textToRemove)` helper in the same file, then builds the `Routes` array from `routerUrls` instead of hard-coded path strings. Nested/child routes call `nestedUrlHandler` against their parent's URL — follow this pattern when adding a route rather than writing a literal path string.

- Public routes (`sign-in`, `welcome`, `mqtt`) sit outside the authenticated shell.
- The three domains (`main`, `fare`, `maintenance`, plus `fms`) are nested children under `routerUrls.private`.
- `AuthGuard` on the private shell route is currently **commented out** (`// canActivate: [AuthGuard]`) — check the current state of that line before assuming route-level auth is enforced; do not assume it's active.
- The [`/mqtt` route](../../src/app/views/mqtt/mqtt.component.ts) is a developer/diagnostics screen for broker config and the live message log — not part of the operator/passenger-facing flow.

## Path aliases

Import via tsconfig aliases, never relative paths across feature boundaries:

`@app/*`, `@models` / `@models/*`, `@components/*`, `@views/*`, `@store/*`, `@services/*`, `@directives/*`, `@data/*`, `@dummyData/*`, `@env/*`, `@styles/*`, `@assets/*`

## Build configurations / environments

`angular.json` defines three environments via file replacement of `src/environments/environment.ts`:

| Environment | File | Notes |
|---|---|---|
| dev | `environment.ts` | `env: 'dev'`, `dummy: true`. MQTT topics suffixed with `localDeveloperName` |
| UAT | `environment.uat.ts` | |
| prod | `environment.prod.ts` | |

`dummy: true` activates the dummy-data simulator — see [dummy-data-simulator.md](dummy-data-simulator.md). `displayAutoClick` and `clickInterval` (also in the environment file) drive an automated UI walkthrough used for demos/testing.

## i18n

ngx-translate, JSON catalogs at `src/assets/i18n/` (`en.json`, `ch.json`), default `en`. All user-facing strings go through the `translate` pipe/service — **add new keys to both catalogs**, never hardcode English (or any) text directly into a template. `aria-label`s and other accessibility text follow the same rule.

## SSR (rarely used)

SSR scaffolding exists ([server.ts](../../server.ts), `main.server.ts`, `@angular/ssr`) but the terminal runs as a client app in normal operation; `provideClientHydration()` is configured. To exercise it:

```bash
npm run build && npm run serve:ssr:lta-btds-gui   # node dist/lta-btds-gui/server/server.mjs
```

## Conventions

- TypeScript `strict` is on, plus Angular `strictTemplates`. Note `noImplicitAny: false` — present for legacy reasons, don't lean on it in new code.
- Imports are auto-sorted by `eslint-plugin-simple-import-sort`; let `npm run lint:fix` order them rather than hand-ordering.
- Node is pinned to the version in `.nvmrc`; run `nvm use` before installing. Husky + lint-staged run eslint/prettier on staged files at commit time — don't bypass with `--no-verify`.
