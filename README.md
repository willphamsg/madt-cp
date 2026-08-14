### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Deployment

1. Run `npm install` to install all the packages.

2. Run `npm install -g @angular/cli@20.2.2`

3. Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Version Required

node version 18 or later
npm version 10.2.3 or later

The application structure:

```
└── 📁src
    └── 📁app
        └── 📁components
            └── 📁dialog
                └── dialog.component.html
                └── dialog.component.scss
                └── dialog.component.spec.ts
                └── dialog.component.ts
            └── 📁layout
                └── layout.component.html
                └── layout.component.scss
                └── layout.component.ts
        └── 📁guards
            └── auth.guard.ts
        └── 📁models
            └── user.ts
        └── 📁services
            └── mqtt.service.ts
        └── 📁store
            └── 📁main
                └── main.action.ts
                └── main.reducer.ts
            └── app.state.ts
        └── 📁views
            └── 📁bus-operation
                └── 📁start-trip
                    └── start-trip.component.html
                    └── start-trip.component.scss
                    └── start-trip.component.spec.ts
                    └── start-trip.component.ts
            └── 📁fms
                └── fms.component.html
                └── fms.component.scss
                └── fms.component.ts
            └── 📁main
                └── 📁breakdown
                    └── breakdown.component.html
                    └── breakdown.component.scss
                    └── breakdown.component.spec.ts
                    └── breakdown.component.ts
            └── 📁maintenance
                └── 📁fare
                    └── 📁bls-information
                        └── bls-information.component.html
                        └── bls-information.component.scss
                        └── bls-information.component.spec.ts
                        └── bls-information.component.ts
            └── 📁sign-in
                └── sign-in.component.html
                └── sign-in.component.scss
                └── sign-in.component.spec.ts
                └── sign-in.component.ts
            └── 📁ticketing
                └── 📁cancel-ride-cv1
                    └── cancel-ride-cv1.component.html
                    └── cancel-ride-cv1.component.scss
                    └── cancel-ride-cv1.component.spec.ts
        └── app.component.html
        └── app.component.scss
        └── app.component.ts
        └── app.routes.ts
    └── 📁assets
        └── 📁fonts
            └── 📁Inter
                └── Inter-Black.ttf
        └── 📁i18n
            └── ch.json
            └── en.json
        └── 📁images
            └── 📁icons
                └── 📁main
                    └── close-icon.svg
        └── mqtt-config.json
    └── 📁styles
        └── _variables.scss
        └── styles.scss
    └── index.html
    └── main.ts
```
