# WolfPage Portal

Frontend administrativo para el MVP interno de WolfPage.

## Flujo MVP

- `/login`: acceso interno con JWT.
- `/app/dashboard`: resumen operativo.
- `/app/templates`: templates publicados.
- `/app/pages/new`: generacion de pagina desde template.
- `/app/requests/:id`: seguimiento de solicitud.
- `/app/pages`: paginas generadas.
- `/app/pages/:id`: preview y detalle.
- `/app/settings/users`: usuarios internos por tenant.

El API base usado por el portal esta en `src/app/core/api/api.config.ts`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
