# Scout Panel

Panel de scouting de futbolistas: listado con filtros, detalle con estadísticas y métricas derivadas, comparador lado a lado entre jugadores y shortlist personal por usuario.

<!-- screenshot: vista general del dashboard de jugadores -->

---

## Stack y por qué

Tres pilares fundamentales y el motivo detrás de cada elección:

### PostgreSQL

Decidido **por consigna del challenge**. Se levanta dockerizado para que el setup local sea reproducible en cualquier máquina, sin tener que instalar Postgres nativo. La configuración vive en [docker-compose.yml](docker-compose.yml) y el schema en [backend/prisma/models/](backend/prisma/models/).

### Next.js (frontend)

Elegido porque el proyecto demanda una UI con múltiples capas —dashboards interactivos, gráficos
en tiempo real y un comparador de jugadores— donde Next.js aporta ventajas reales frente a una
SPA clásica:

- **App Router + Server Components** — la grilla de jugadores se pre-renderiza con los datos ya resueltos en el servidor, sin "flash" de spinner antes del primer paint (ver [frontend/app/(app)/players/page.tsx](<frontend/app/(app)/players/page.tsx>)).
- **Streaming con `<Suspense>`** — la página entrega el shell (header, filtros, skeletons) al instante y rellena la grilla a medida que llega la respuesta del backend, sin orquestar loading states a mano.
- **File-based routing alineado al producto** — `/players`, `/players/[id]`, `/compare`, `/players/shortlist`, `/(auth)/login`, `/(auth)/register`. Agregar una vista nueva es crear un archivo.
- **Route groups con layouts independientes** — `(app)` y `(auth)` separan la zona autenticada (sidebar + header) de la pública (login/registro) sin que se note en la URL, y cada layout se monta una sola vez para todas sus rutas hijas.
- **Optimizaciones de fábrica** — code-splitting por ruta, prefetch en `<Link>`, `next/font` y Turbopack en dev. Se nota en vistas pesadas como el detalle con Recharts o el comparador.
- **Mismo ecosistema React** — TanStack Query, Zustand, react-hook-form, shadcn/ui y Recharts encajan sin adapters ni capas de compatibilidad.

### NestJS (backend)

Elegido porque estructura el backend por dominio desde el arranque —sin tener que inventar
convenciones:

- **Módulos por dominio** — `AuthModule`, `PlayersModule`, `ShortlistModule`, `SeedModule`, `PrismaModule`. Cada feature aísla controller, service, DTOs y tests; agregar una nueva es replicar la receta.
- **Inyección de dependencias** — los servicios reciben `PrismaService`, `JwtService`, etc. por constructor, lo que hace trivial mockearlos en tests unitarios sin tooling extra (ver [backend/src/shortlist/shortlist.service.spec.ts](backend/src/shortlist/shortlist.service.spec.ts)).
- **Pipes globales (`ValidationPipe`)** — `class-validator` + `class-transformer` validan y normalizan DTOs antes de tocar un service, descartando payloads inválidos automáticamente.
- **Guards reutilizables (`AuthGuard`)** — la lectura del JWT (header `Authorization` o cookie `auth_token`) vive en un solo lugar y se aplica con un decorador en cualquier endpoint protegido.
- **Filtros de excepciones** — `HttpExceptionFilter` + `PrismaExceptionFilter` mapean errores de Prisma (unique constraint, not found) a respuestas HTTP con shape consistente, así el front consume siempre el mismo formato.
- **Swagger nativo** — los mismos decoradores que documentan DTOs y endpoints generan `/docs` y `openapi.json` automáticamente, sin doble fuente de verdad.
- **TypeScript end-to-end** — DTOs, modelos Prisma y mappers comparten tipos en todo el camino request → DB → response, eliminando una clase entera de bugs en runtime.

---

## Setup local

### Prerequisitos

- Node.js 20+
- pnpm 10 (`npm i -g pnpm`)
- Docker Desktop **corriendo** en tu máquina

### 1. Base de datos

Desde la **raíz del repo** (`scout-panel/`), con Docker Desktop abierto:

```bash
# desde la raíz del repo: scout-panel/
docker compose up -d
```

Esto levanta un Postgres 16 en el puerto `5432` con usuario/password `postgres/postgres` y la base `scout_panel_db` (ver [docker-compose.yml](docker-compose.yml)).

<!-- screenshot: contenedor scout-panel-db corriendo en Docker Desktop -->

### 2. Backend

Desde la carpeta **`backend/`** (puerto `8080`):

```bash
# desde la raíz del repo
cd backend
pnpm install
pnpm dev
```

Notas:

- El script `pnpm dev` corre `prisma db push` antes de arrancar Nest, así que el schema queda sincronizado contra la DB sin migraciones manuales (ver [backend/package.json](backend/package.json)).
- Al primer boot, el `SeedService` carga jugadores fixture (Boca, River, Barcelona, Real Madrid) y crea el usuario admin si no existe. Es idempotente: en boots siguientes detecta que ya está todo y no rompe nada.

### 3. Frontend

Desde la carpeta **`frontend/`**, en una **terminal nueva** para no matar al backend (puerto `3000`):

```bash
# desde la raíz del repo, en otra terminal
cd frontend
pnpm install
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Credenciales de prueba

Usuario seed creado automáticamente al arrancar el backend (defaults en [backend/src/config/env.schema.ts](backend/src/config/env.schema.ts)):

- Email: `admin@scout.local`
- Password: `admin12345`

Alternativamente, también podés **crear tu propio usuario** desde la pantalla de registro en [http://localhost:3000/register](http://localhost:3000/register) (ver [frontend/app/(auth)/register/page.tsx](<frontend/app/(auth)/register/page.tsx>)). El registro pega contra `POST /auth/register`, hashea el password con bcrypt, emite un JWT y lo deja seteado como cookie HttpOnly `auth_token` — el usuario queda logueado automáticamente al terminar.

<!-- screenshot: pantalla de login con credenciales precargadas -->
<!-- screenshot: pantalla de registro para crear un usuario nuevo -->

### Documentación de la API

Con el backend corriendo, la documentación interactiva queda disponible en:

- **UI navegable (Swagger):** [http://localhost:8080/docs](http://localhost:8080/docs)
- **Spec OpenAPI exportada:** [backend/openapi.json](backend/openapi.json) (se regenera en cada arranque en modo dev — ver [backend/src/config/swagger.ts](backend/src/config/swagger.ts))

Desde Swagger UI se pueden probar endpoints con `Try it out`. Para los que requieren sesión, primero pegale a `POST /auth/login` con tus credenciales, copiá el `Set-Cookie: auth_token=<JWT>` de la response (o el body si exponés el token), apretá el botón **Authorize** y pegalo como Bearer. Queda persistido automáticamente entre reloads (configurado con `persistAuthorization: true` y `addBearerAuth` en `swagger.ts`).

<!-- screenshot: vista general de Swagger UI listando los tags players / shortlist / auth -->
<!-- screenshot: endpoint expandido con Try it out y respuesta de ejemplo -->

---

## Tests

Ambos proyectos usan **Jest** como test runner. Los tests están pensados para correr **sin necesidad de levantar la base de datos ni el server** (todo lo que toca Prisma o Nest se mockea), salvo el e2e del backend que sí instancia el `AppModule` completo.

### Backend

Desde la carpeta **`backend/`**:

```bash
# unit tests
pnpm test

# unit tests en modo watch
pnpm test:watch

# unit tests con reporte de cobertura (output en backend/coverage/)
pnpm test:cov

# end-to-end tests (usa test/jest-e2e.json)
pnpm test:e2e
```

**Tipos de tests cubiertos:**

- **Unit tests de servicios** — `ShortlistService` con `PrismaService` mockeado, cubriendo casos felices y todas las ramas de error (`NotFoundException`, `BadRequestException`, conflictos por unique constraint de Prisma) — ver [backend/src/shortlist/shortlist.service.spec.ts](backend/src/shortlist/shortlist.service.spec.ts).
- **Unit tests de mappers** — transformaciones de entidades Prisma a DTOs de respuesta (`PlayerDetailMapper`, `PlayerListCardMapper`) para verificar el contrato que ve el frontend — ver [backend/src/players/mappers/](backend/src/players/mappers/).
- **Unit tests de validación de DTOs** — `class-validator` + `class-transformer` sobre los DTOs de entrada (`PlayerFiltersDto`, `AddShortlistDto`, `PaginationDto`) para asegurar que payloads inválidos se rechacen antes de llegar a los servicios.
- **Unit tests de utilidades y query builders** — lógica pura de scoring (`skillful-foot-score.util`), construcción de filtros Prisma (`player-list-where`) y helpers de paginación.
- **Tests de controllers** — smoke test del `AppController` para verificar el wiring básico de Nest.
- **End-to-end tests (`test/app.e2e-spec.ts`)** — levanta el `AppModule` completo con `@nestjs/testing` y dispara requests reales con `supertest`. Pensado como base extensible para cubrir endpoints de `players` y `shortlist` con DB de test (ver sección [Qué mejoraría con más tiempo](#a-nivel-de-proyecto)).

Configuración de Jest en [backend/package.json](backend/package.json) (clave `jest`) y del runner e2e en [backend/test/jest-e2e.json](backend/test/jest-e2e.json).

### Frontend

Desde la carpeta **`frontend/`**:

```bash
# tests
pnpm test

# modo watch
pnpm test:watch

# con reporte de cobertura (output en frontend/coverage/)
pnpm test:coverage
```

**Tipos de tests cubiertos:**

- **Unit tests de utilidades puras** — funciones de transformación y normalización: parseo de query params (`player-list-params`), metadata de stats por posición (`player-stats-metadata`), helpers de comparación visual (`compare-colors`) y manejo de errores (`errors`) — ver [frontend/lib/](frontend/lib/) y [frontend/features/players/utils/](frontend/features/players/utils/).
- **Unit tests de stores** — el store de Zustand para selección de jugadores a comparar (`selection-store`), validando reglas de negocio del lado cliente: límite de 2 jugadores, deduplicación, reset de estado.
- **Component tests con React Testing Library** — render del `PlayerCard` con mocks de `next/navigation`, verificando que la UI muestra los datos correctos y reacciona a interacciones (click → `router.push`). Sigue la filosofía de Testing Library: testear comportamiento observable, no implementación.

Configuración con el preset oficial de Next.js (`next/jest.js`), entorno **jsdom** y `@testing-library/jest-dom` cargado en [frontend/jest.setup.ts](frontend/jest.setup.ts). Configuración completa en [frontend/jest.config.ts](frontend/jest.config.ts).

---

## Decisiones técnicas

### Backend

- **NestJS 11** — arquitectura modular por dominio + inyección de dependencias para mantener servicios chicos y testeables.
- **Prisma 7 + `@prisma/adapter-pg` + `nestjs-prisma`** — schema tipado, type-safety end-to-end y modelos divididos por entidad en [backend/prisma/models/](backend/prisma/models/) en vez de un único `schema.prisma` gigante.
- **Auth manual con JWT** — implementación propia y mínima sobre `jsonwebtoken` + `bcrypt`. El backend expone `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` y `GET /auth/me` ([backend/src/auth/auth.controller.ts](backend/src/auth/auth.controller.ts)). El token se firma con `JWT_SECRET` y se setea como cookie **HttpOnly** `auth_token` (ver [backend/src/auth/auth.cookie.ts](backend/src/auth/auth.cookie.ts)) con `SameSite=None; Secure` en prod y `Lax` en dev. El `AuthGuard` ([backend/src/common/guards/auth.guard.ts](backend/src/common/guards/auth.guard.ts)) acepta el token tanto del header `Authorization: Bearer` como de la cookie, así Swagger UI funciona con Bearer y el navegador con la cookie sin tocar nada.
- **Zod** — validación de variables de entorno con fail-fast en el boot. Si falta una env var crítica, el proceso muere con un error legible en vez de fallar a runtime (ver [backend/src/config/env.schema.ts](backend/src/config/env.schema.ts)).
- **class-validator + class-transformer** — validación declarativa de DTOs vía `ValidationPipe` global con `whitelist: true`, que descarta campos no declarados y transforma payloads automáticamente.
- **Swagger / OpenAPI (`@nestjs/swagger`)** — documentación auto-generada en `/docs` a partir de decoradores en DTOs y controllers; además exporta `openapi.json` en dev. **Por qué documentar con Swagger:** es un contrato vivo entre back y front, y permite que un supervisor evalúe la API sin tener que leer código ni levantar Postman.
- **Filtros globales (`HttpExceptionFilter`, `PrismaExceptionFilter`)** — respuestas de error consistentes en formato JSON, mapeando errores de Prisma (constraint violations, not found, etc.) a códigos HTTP correctos.
- **Seed idempotente en boot** — el `SeedService` carga fixtures y usuario admin si faltan, controlado por la env var `SEED_ON_BOOT` (default `true`). Útil para que un supervisor clone el repo y vea datos sin pasos extra.

<!-- screenshot: estructura modular del backend en explorador de archivos -->

### Frontend

- **Next.js** — framework base del frontend. App Router + Server Components permiten pre-renderizar
  las vistas de análisis con datos ya cargados; el file-based routing mapea directo a la estructura
  del producto (`/players/[id]`, `/compare`, `/dashboard`); y el ecosistema React encaja con todo
  el resto del stack sin fricción.

* **TanStack Query v5** — cache, refetch, invalidación y estados de carga del lado cliente. Devtools incluidas para inspeccionar queries en dev. Configuración del cliente en [frontend/lib/query-client.tsx](frontend/lib/query-client.tsx).
* **Zustand** — store ligero para selección de jugadores a comparar ([frontend/stores/selection-store.ts](frontend/stores/selection-store.ts)). Elegido sobre Context API por mejor DX (menos boilerplate) y mejor performance (subscripciones granulares, no re-renderiza todo el árbol).
* **react-hook-form + @hookform/resolvers + Zod** — formularios performantes (uncontrolled inputs, menos re-renders) con validación tipada compartida con el resto de la app.
* **shadcn/ui + Radix UI** — componentes accesibles, headless y **sin lock-in**: el código de cada componente vive en el repo, así que se puede personalizar libremente.
* **Tailwind CSS v4** — utility-first, con theming centralizado en `globals.css`.
* **Recharts** — gráficos del detalle de jugador y del comparador. Buena DX con React y soporte nativo de SVG.
* **Sonner** — toasts (ya configurado en [frontend/app/layout.tsx](frontend/app/layout.tsx)) con tema custom integrado al diseño.
* **lucide-react** — set de iconos consistente y tree-shakeable.

<!-- screenshot: pantalla de comparador con 2 jugadores -->
<!-- screenshot: detalle de jugador con gráficos -->

---

## Modelo de datos

El schema está partido en archivos separados dentro de [backend/prisma/models/](backend/prisma/models/) y [backend/prisma/enums/](backend/prisma/enums/) en vez de un único `schema.prisma` monolítico: cada modelo se lee y modifica aislado, y el diff de un PR muestra solo lo que cambió. La idea general es **separar lo estable del jugador (datos personales) de lo que cambia temporada a temporada (club, número, contrato, stats)**, para no ensuciar la entidad principal con datos que dependen del contexto.

<!-- screenshot: diagrama ER del modelo de datos (Player ↔ PlayerSeason ↔ Club / Season / Stats / Activity) -->

### Entidades

- **`Player`** ([player.prisma](backend/prisma/models/player.prisma)) — el **jugador como persona**: nombre, fecha de nacimiento, nacionalidad, posición, altura, peso, pie hábil y foto. Atributos que no cambian temporada a temporada. Tiene índices por `name`, `nationality` y `position` para que el listado filtre y ordene sin escanear toda la tabla.
- **`Club`** ([club.prisma](backend/prisma/models/club.prisma)) — entidad **club** normalizada (nombre, país, liga, logo). Vivir aparte evita duplicar strings entre jugadores que comparten club y habilita futuras vistas o filtros por club/liga.
- **`Season`** ([season.prisma](backend/prisma/models/season.prisma)) — **temporada futbolística** (ej. `2023-2024`) con fechas de inicio/fin y un flag `isCurrent`. Existe como entidad propia para soportar la futura vista histórica mencionada en la sección de mejoras (en vez de quemar la temporada como string suelto).
- **`PlayerSeason`** ([player-season.prisma](backend/prisma/models/player-season.prisma)) — **tabla pivote** que une `Player` + `Club` + `Season` con datos del momento: número de camiseta y fechas de contrato. Es el centro del modelo: separa lo **estable del jugador** de lo **contextual** (club, número, contrato). El `@@unique([playerId, seasonId])` impide que un jugador esté en dos clubes en la misma temporada.
- **`PlayerSeasonStats`** ([player-season-stats.prisma](backend/prisma/models/player-season-stats.prisma)) — **métricas agregadas** del rendimiento de un jugador en una temporada, organizadas en las 6 dimensiones del producto: **DRI** (dribbling), **VEL** (pace), **PAS** (passing), **TIR** (shooting), **DEF** (defending) y **FZA** (physical). Vive aparte de `PlayerSeason` por dos motivos: (a) es **opcional** (puede no haberse cargado todavía, modelado como relación 1-a-1), y (b) es una tabla **ancha** (~60 columnas) que el listado no necesita traer y solo se hidrata en el detalle/comparador.
- **`PlayerActivity`** ([player-activity.prisma](backend/prisma/models/player-activity.prisma)) — **minutos jugados por mes** dentro de cada `PlayerSeason`, una fila por (`playerSeasonId`, `monthDate`). Alimenta el gráfico de actividad del detalle. El `@@unique` evita duplicados por mes y el índice por `playerSeasonId` acelera el query del detalle.
- **`User`** ([auth.prisma](backend/prisma/models/auth.prisma)) — **usuario autenticado** del panel: email único, nombre y `passwordHash` (bcrypt). Dueño de las entradas de su shortlist personal.
- **`ShortlistEntry`** ([shortlist-entry.prisma](backend/prisma/models/shortlist-entry.prisma)) — **relación many-to-many** entre `User` y `Player` con `createdAt` para ordenar por fecha de agregado. El `@@unique([userId, playerId])` garantiza idempotencia: un mismo jugador no puede estar dos veces en la shortlist de un usuario, y esa violación se mapea a `409 Conflict` vía `PrismaExceptionFilter`.

### Enums

- **`Position`** ([position.prisma](backend/prisma/enums/position.prisma)) — posiciones tácticas tipadas alineadas con la notación estándar del fútbol moderno: `GK`, `RB`, `RWB`, `CB`, `LB`, `LWB`, `CDM`, `CM`, `CAM`, `RW`, `RM`, `LW`, `LM`, `ST`, `CF`, `SS`. Usar un enum en vez de string libre elimina typos en seed, permite filtrar de manera segura desde el front y habilita lógica por posición (ej. métricas distintas para arqueros vs. delanteros).
- **`PreferredFoot`** ([preferred-foot.prisma](backend/prisma/enums/preferred-foot.prisma)) — `RIGHT` / `LEFT` / `BOTH`. Imprescindible para el cálculo del **skillful foot score**, que combina volumen y eficacia con la pierna no hábil.

### Decisiones transversales

- **Cascadas pensadas** — borrar un `User` borra sus `ShortlistEntry`; borrar un `Player` borra sus `PlayerSeason` en cascada, y a su vez `PlayerSeasonStats` y `PlayerActivity`. `Club` y `Season` **no** se borran en cascada porque son entidades compartidas entre jugadores.
- **`snake_case` en DB, `camelCase` en TS** — vía `@@map` a nivel tabla (ej. `player_season_stats`), de modo que las queries SQL crudas siguen el estilo de Postgres sin contaminar los tipos de TypeScript.
- **Métricas derivadas no persistidas** — todo lo que es función de otras columnas (skillful foot score, matches per yellow/red card, ratios por 90 min, etc.) se calcula en el service layer al armar el DTO de respuesta (ver [backend/src/players/utils/skillful-foot-score.util.ts](backend/src/players/utils/skillful-foot-score.util.ts)). Si cambia la fórmula, no hace falta migrar datos.
- **Schema en `prisma db push`, no migraciones** — durante el desarrollo del challenge se priorizó velocidad de iteración. En producción real, esto se reemplazaría por `prisma migrate` con migraciones versionadas.

---

## Qué mejoraría con más tiempo

### A nivel de proyecto

- **Separar back y front en repos distintos.** Hoy conviven en un monorepo plano sin tooling (sin pnpm workspaces ni Turborepo). Repos separados habilitan: pipelines de CI/CD independientes (deploys del back sin esperar al front y viceversa), versionado y releases desacoplados, permisos finos por equipo, y PRs con menos ruido. El contrato entre ambos queda atado por el `openapi.json` generado por Swagger, que se puede publicar como paquete npm para que el front genere su cliente HTTP tipado automáticamente.
- **Husky + lint-staged + commitlint.** Pre-commit corriendo `eslint --fix` y `prettier` solo sobre archivos staged, y pre-push corriendo `pnpm test` y `pnpm lint` en ambos proyectos. Esto **filtra errores antes de que lleguen al repo** y mantiene el historial de commits limpio.

### A nivel de producto

- **Métricas específicas para arqueros.** La versión actual está pensada para comparar perfiles ofensivos y mediocampistas; agregar dimensiones propias (atajadas, % de salidas exitosas, distribución, goles esperados evitados / xGA) y un layout de comparación diferenciado para esa posición.
- **Métricas por posición histórica.** Para jugadores que ocuparon varias posiciones en su carrera, mostrar el split de rendimiento por posición y resaltar la diferencia (por ejemplo, un jugador que pasó de extremo a lateral con métricas defensivas distintas según el rol).
- **Mapa de calor (heatmap).** Distribución posicional de cada jugador y comparación side-by-side entre dos perfiles, para tener una lectura visual del comportamiento en cancha.
- **Historial de lesiones.** Timeline por jugador (tipo de lesión, duración, partidos perdidos) para que el análisis de un jugador contemple disponibilidad real, no solo rendimiento estadístico.
- **Filtros por temporada / vista histórica acumulada.** Hoy el seed deja todo en `2023-2024`; permitir filtrar por temporada o ver totales de carrera enriquece mucho la comparación.
- **Posiciones compatibles / recomendadas.** Sugerir posiciones alternativas a partir del perfil estadístico (por ejemplo, un extremo con buen 1v1 y volumen defensivo podría jugar de lateral).
- **Dashboard principal con recomendaciones automáticas.** Una sección de descubrimiento que destaque: (a) jugadores cuyas métricas vienen **creciendo significativamente por encima de la media** de su posición/edad ("trending up"), y (b) **recomendaciones de perfiles similares** basadas en distancia entre vectores de stats normalizadas.
