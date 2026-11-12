# game-catalog-api

Proyecto de portafolio y aprendizaje de Juan (QA Automation → DevOps). API REST de catálogo de videojuegos en TypeScript. Hoy está hecha con Express (2 endpoints en un solo archivo) y **se va a migrar a NestJS**. Después crece hacia un pipeline DevOps completo: tests, CI/CD, Docker, base de datos y despliegue en la nube.

Objetivo doble: (1) aprender NestJS y backend haciendo, y (2) que el repo muestre un pipeline DevOps real en el CV. Lo primero manda sobre lo segundo.

Repo hermano: `~/Projects/Playwright-automation` (suite E2E). Idea futura, no acordada: usar esta API como sistema bajo prueba de los tests de API de ese repo.

## Cómo trabajar conmigo (modo aprendizaje)

- Soy el autor del código y **yo ejecuto todos los comandos y ediciones**. Tú eres mentor senior: explicas paso a paso (comando exacto, qué debería verse en `git status` / `git diff` / la salida) y, cuando digo "revisa", verificas el estado con comandos de solo lectura y respondes ✅/❌ por punto.
- Antes de cambiar algo no trivial, explícame en 3–5 líneas qué vamos a hacer y por qué. Espera mi OK.
- Un cambio por vez, un commit por cambio. Nunca mezcles refactor + feature + CI + formato en un commit.
- Después de cada cambio, dime qué pregunta me harían en una entrevista sobre eso y cómo responderla, y agrégala a `interview-notes.md` (archivo local, excluido con `.git/info/exclude`, nunca se sube al repo).
- Si pido "arréglalo", primero muéstrame la causa raíz y dame la opción de arreglarlo yo. Si insisto, hazlo.
- No agregues dependencias, carpetas ni abstracciones que no pedí. Si crees que falta algo, propónlo.
- Cuando corrijas algo mío, di qué estaba mal y cuál es la convención correcta, sin reescribir todo.
- Responde en español. Código, nombres, commits, PRs y comentarios en inglés.
- Verifica antes de afirmar: nada en el README, en un PR o en la descripción de GitHub que el repo no respalde todavía.

## Flujo de trabajo

- Una rama por ítem (`feat/`, `refactor/`, `chore/`, `ci/`, `docs/`), PR a `main` y merge con **"Create a merge commit"** (no squash, para conservar los commits atómicos): `gh pr merge <n> --merge --delete-branch`.
- Antes de cada commit, revisar `git diff` y `git diff --staged`: el commit tiene que contener solo el cambio esperado.
- Antes de un cambio riesgoso, sacar una **línea base** y compararla después: `npm run build`, los tests y `curl` a los endpoints.
- Revisar `pwd` antes de correr `git` o `gh`: en `~/Projects` hay dos repos, y `gh` actúa sobre el repo de la carpeta actual.
- Si la salida es larga, usar `git --no-pager ...`. Si queda pegado en `less`, salir con `q`.
- Cerrar cada ítem con un PR chico `docs:` que actualice "Estado actual" y el checkbox de este archivo.
- Ante un CI en rojo: leer el log (`gh run view <id> --log-failed`) y comparar con la última ejecución en `main` antes de suponer que lo rompió el PR.

## Entorno local

- Omarchy (Arch Linux). Node global = 26 (mise, "latest"), pero este proyecto apunta a **Node 22** (`@types/node` ^22). Hasta fijarlo en el repo: `mise exec node@22 -- <comando>`.
- VS Code con Prettier global y `prettier.requireConfig: true`: solo formatea si el repo tiene `.prettierrc`. NestJS genera uno, así que **acá Prettier sí va a formatear al guardar**. Eso es formato del proyecto, no ruido, pero si un formateo toca archivos que no eran parte del cambio, va en un commit aparte.
- Extensiones útiles para este repo: ESLint, Prettier, NestJS Snippets, Jest Runner, Error Lens, Pretty TS Errors, Container Tools.

## Stack

- **Hoy:** Express 5 + TypeScript 7 (`tsc` → `dist/`). Compila con Node 22.
- **Objetivo:** NestJS + TypeScript, con el CLI usado vía `npx @nestjs/cli` (sin instalar nada global).
- Gestor de paquetes: **npm**, con un solo lockfile (`package-lock.json`). Nada de pnpm ni yarn.
- Tests: Jest para unit tests (`*.spec.ts` junto al código) y Supertest para e2e (`test/*.e2e-spec.ts`), que es lo que trae Nest por defecto.
- Nest depende de `experimentalDecorators` y `emitDecoratorMetadata`. Después de la migración hay que verificar que la versión de TypeScript que quede los soporte y que el build y los tests pasen. No asumirlo.

## Estructura objetivo (NestJS)

```
src/
  main.ts                 # bootstrap: crea la app, pipes globales, puerto por env
  app.module.ts           # módulo raíz
  health/                 # GET /health
  games/                  # un módulo por dominio
    games.module.ts
    games.controller.ts   # HTTP: rutas, status codes, DTOs
    games.service.ts      # lógica de negocio
    games.service.spec.ts # unit test junto al archivo
    dto/                  # create-game.dto.ts, update-game.dto.ts
    entities/             # game.entity.ts
test/
  *.e2e-spec.ts           # e2e con Supertest
```

## Convenciones

- **Controller delgado, lógica en el service.** El controller solo traduce HTTP (rutas, status, DTOs). Es la misma idea que en Playwright, donde las aserciones van en el test y no en el Page Object: cada capa tiene una sola responsabilidad.
- **Inyección de dependencias por constructor.** Nunca `new GamesService()` dentro de un controller. Es lo que permite mockear el service en los tests, igual que las fixtures en Playwright.
- **Validar en el borde** con DTOs y `ValidationPipe`. Status codes explícitos y correctos: 200, 201, 204, 400, 404 y 409.
- Nombres de archivo en kebab-case con el sufijo de Nest (`games.controller.ts`). Identificadores en inglés (`Game`, `hoursPlayed`, `/games`).
- Configuración y secretos por variables de entorno, con `.env.example` en el repo y `.env` en `.gitignore`. Nada hardcodeado (puerto, URL de la base de datos).
- `node_modules/`, `dist/`, `coverage/` y `.env` en `.gitignore`. Todo archivo de texto termina con salto de línea.
- **No tapar errores de tipos** con `any`, `@ts-ignore` o `declare`: primero buscar por qué TypeScript no ve el tipo.
- **Nada de `latest`** en lo que afecte la reproducibilidad: runner de CI (`ubuntu-24.04`), Node (22, desde un archivo de versión), imágenes Docker (`node:22-slim`). Las versiones se suben a propósito, en su propio PR.
- Commits en inglés, en imperativo y con prefijo: `feat:`, `fix:`, `refactor:`, `test:`, `ci:`, `chore:`, `docs:`.

## Comandos

Hoy (Express):

```bash
npm ci
npm run build          # tsc → dist/
npm start              # node dist/index.js (puerto 3000)
curl localhost:3000/health
curl localhost:3000/juegos
```

Después de la migración (scripts estándar de Nest):

```bash
npm ci
npm run start:dev      # watch mode
npm run build
npm test               # unit
npm run test:e2e
npm run test:cov
npm run lint
npx @nestjs/cli g resource games
```

## Estado actual y pendientes

Estado (nov 2026): 2 commits, todo en `src/index.ts`. `GET /health` → `{ "status": "ok" }` y `GET /juegos` → array en memoria con 1 juego. El build con `tsc` funciona con Node 22. Sin tests, lint, CI, Docker ni README.

Hallazgos de la revisión inicial (se resuelven en los ítems de abajo):
1. `.gitignore` contiene las líneas `cat > .gitignore << 'EOF'` y `EOF` (se pegó el comando dentro del archivo) y le falta el salto de línea final.
2. Código y commits en español (`Juego`, `horasJugadas`, `/juegos`).
3. `"main": "index.js"` apunta a un archivo que no existe, `dev` no tiene watch y el puerto 3000 está hardcodeado.
4. La descripción de GitHub dice Express y no tiene topics.

Orden sugerido. Cada ítem = una rama y un PR chico:

- [ ] **Migración a NestJS sin cambiar el contrato.** Antes de empezar, guardar la línea base con `curl` de `/health` y `/juegos`. Generar el proyecto Nest en una carpeta temporal y traer los archivos a este repo, para conservar el historial de git. Un test e2e con Supertest tiene que demostrar que las respuestas son idénticas. Con esto se reemplaza el `.gitignore` roto y se corrigen `main` y los scripts. Fijar Node 22 con un archivo de versión que lean mise y el CI.
- [ ] **Nombres en inglés:** `Game`, `hoursPlayed`, `/games`. Es un cambio de contrato, así que los tests e2e se actualizan en el mismo commit.
- [ ] **CRUD completo** con DTOs, `ValidationPipe` y status codes correctos. Unit tests del service (con el provider mockeado) y e2e de cada endpoint.
- [ ] **Configuración por env:** `PORT`, `.env.example`.
- [ ] **CI en GitHub Actions:** lint, build, unit y e2e. `runs-on: ubuntu-24.04`, Node 22 desde el archivo de versión, `cache: npm`, `npm ci`, `permissions` mínimos, `concurrency` y timeout de 15 minutos.
- [ ] **PostgreSQL:** decidir entre TypeORM y Prisma, con migraciones. En CI, con un *service container* de Postgres.
- [ ] **Docker:** Dockerfile multi-stage (build → runtime `node:22-slim`, usuario no root, `HEALTHCHECK` contra `/health`) y `docker-compose` con la API y Postgres.
- [ ] **Swagger / OpenAPI** con `@nestjs/swagger`.
- [ ] **README:** badge de CI, cómo correrlo en local y con Docker, y la lista de endpoints.
- [ ] **Deploy en la nube con CD desde `main`:** elegir un proveedor con tier gratuito. La descripción del repo ya lo promete.

## Qué debe poder contar Juan en una entrevista (checklist de aprendizaje)

- Qué agrega NestJS sobre Express (por defecto corre sobre Express) y por qué migrar sin cambiar el contrato, demostrándolo con tests e2e.
- Module, Controller y Provider: la responsabilidad de cada uno.
- Inyección de dependencias: qué es, qué problema resuelve y cómo se mockea un provider con `Test.createTestingModule`.
- Ciclo de vida de un request en Nest: middleware → guards → interceptors → pipes → handler → filters.
- DTO + `ValidationPipe`: por qué se valida en el borde.
- Diferencia entre unit test y e2e test en Nest, y qué cubre cada uno.
- Status codes REST y cuándo usar cada uno.
- Dockerfile multi-stage, por qué no correr como root y para qué sirve el `HEALTHCHECK`.
- *Service containers* en GitHub Actions y por qué fijar las versiones del runner, de Node y de las imágenes.
- Health checks: diferencia entre *liveness* y *readiness*.

## Para el CV

Descripción actual en GitHub: *"REST API with Node.js, TypeScript and Express — evolving into a full DevOps pipeline (Docker, CI/CD, cloud)"*. Actualizarla después de la migración (NestJS) y, a medida que se cumplan los ítems, agregar tests, CI, Docker y deploy. Topics solo de lo que ya exista en el repo.
