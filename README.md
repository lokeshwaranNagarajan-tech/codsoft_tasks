# CODESOFT Projects

This workspace contains three separate applications. Each application has its own package manifest and must be installed and run from its package directory.

## Applications

| Application | Purpose | Main technology | Package directory |
| --- | --- | --- | --- |
| AMCET College Management | College ERP for administrators, faculty, and students, including attendance, marks, fees, subjects, and timetables. | Next.js, TypeScript, Prisma, PostgreSQL | `amcet-college-management/amcet-college-management/` |
| DineDesk | Restaurant ordering and operations: menu browsing, reservations, order tracking, kitchen, and administration. | Next.js, React, NextAuth, PostgreSQL | `dinedesk/dinedesk/` |
| MarketHub | Multi-vendor marketplace with a storefront/vendor dashboard and a separate API service. | Next.js frontend; NestJS, Prisma, PostgreSQL backend | `MULTI-VENDOR E-COMMERCE MARKETPLACE/frontend/` and `MULTI-VENDOR E-COMMERCE MARKETPLACE/backend/backend/` |

## Requirements

- Node.js 20 or newer and npm.
- PostgreSQL for persistent data in AMCET College Management and the MarketHub backend. DineDesk can run with its in-memory fallback when PostgreSQL is unavailable.
- A running PostgreSQL service and a database URL for any app you intend to use with persistent data.

Run `npm install` separately in each package directory. There is no root `package.json` or shared install command.

## Run Locally

### AMCET College Management

In PowerShell, from the workspace root:

```powershell
cd "amcet-college-management/amcet-college-management"
npm install
```

Create a `.env` file in that directory and set the PostgreSQL connection string:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/amcet_college_management?schema=public"
```

Create the `amcet_college_management` database in PostgreSQL, then generate Prisma Client and apply the checked-in migrations:

```powershell
npx prisma generate
npx prisma migrate deploy
```

Optionally load the sample college data and start the development server:

```powershell
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed script clears existing attendance, marks, exams, subjects, students, faculty, users, and departments before inserting sample data; only run it against a disposable development database.

Other available scripts: `npm run build`, `npm run start` (after a build), and `npm run lint`.

### DineDesk

```powershell
cd "dinedesk/dinedesk"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). PostgreSQL persistence is optional for a basic local run: the app falls back to in-memory sample menu, order, and reservation data when the database is unavailable. To persist data, create a PostgreSQL database named `dinedesk_db` and configure the connection in `.env.local`, for example:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dinedesk_db"
NEXTAUTH_SECRET="replace-with-a-long-random-local-secret"
ADMIN_EMAIL="admin@example.com"
```

The database helper also accepts `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` (or the corresponding `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` values). Google sign-in needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; the credentials/demo sign-in provider does not require Google credentials. Set real local secrets instead of relying on the development fallback, and do not commit environment files.

Other available scripts: `npm run build`, `npm run start` (after a build), and `npm run lint`.

### MarketHub Frontend and Backend

The storefront can run by itself using its bundled sample products and browser local storage. To start only the frontend:

```powershell
cd "MULTI-VENDOR E-COMMERCE MARKETPLACE/frontend"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend reads `NEXT_PUBLIC_API_URL` when configured; if it is unset or the API request fails, the service layer uses mock data and local storage.

To run the backend as well, use a second terminal:

```powershell
cd "MULTI-VENDOR E-COMMERCE MARKETPLACE/backend/backend"
npm install
```

Create a `.env` file in the backend package directory with a PostgreSQL connection, then generate the Prisma client and sync the schema to the development database:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/markethub?schema=public"
PORT=4000
```

```powershell
npx prisma db push
npm run prisma:generate
npm run start:dev
```

The backend listens at [http://localhost:4000/api](http://localhost:4000/api). Redis is not required for local startup; its cache service uses in-memory caching. The S3 service currently returns mock upload URLs, so AWS credentials and a real S3 bucket are not needed for its present local behavior.

The NestJS controllers expose customer routes under `/api/customer/...` and vendor routes under `/api/vendor/...`. The frontend API service uses its own endpoint paths and falls back to local sample data; configuring `NEXT_PUBLIC_API_URL` alone does not guarantee every storefront feature is wired to the NestJS API. The vendor endpoints also use JWT/role guards, so a matching authentication flow/token is needed to call protected vendor routes.

Frontend scripts: `npm run build`, `npm run start` (after a build), and `npm run lint`. Backend scripts: `npm run build`, `npm run start`, `npm run start:dev`, `npm run start:prod`, and `npm run prisma:generate`.

## Project Structure and Important Files

### AMCET College Management

```text
amcet-college-management/amcet-college-management/
|-- prisma/
|   |-- schema.prisma          # PostgreSQL data model
|   |-- migrations/            # Database migration history
|   `-- seed.ts                # Development sample-data loader
|-- src/
|   |-- app/
|   |   |-- admin/             # Admin pages: students, faculty, fees, exams, reports, etc.
|   |   |-- faculty/           # Faculty dashboard, attendance, marks, and subjects
|   |   |-- student/           # Student dashboard, attendance, marks, fees, and timetable
|   |   |-- api/               # Next.js route handlers for auth and ERP data
|   |   |-- login/             # Login page
|   |   |-- layout.tsx         # Root application layout
|   |   `-- globals.css        # Global styles
|   |-- components/            # Shared UI, admin components, and charts
|   |-- lib/                   # Prisma client, authentication, JWT, and utilities
|   |-- types/                 # Shared TypeScript types
|   `-- proxy.ts               # Request proxy/auth routing logic
|-- package.json               # Scripts and dependencies
`-- prisma.config.ts           # Prisma CLI configuration
```

### DineDesk

```text
dinedesk/dinedesk/
|-- app/
|   |-- admin/, admin-menu/    # Admin dashboards and menu management
|   |-- kitchen/               # Kitchen order queue
|   |-- menu/                  # Customer menu and ordering
|   |-- reserve/               # Table reservation page
|   |-- track/                 # Order tracking page
|   |-- login/                 # Sign-in page
|   |-- api/                   # Next.js API routes for auth, menu, orders, reservations
|   |-- layout.tsx             # Root layout and providers
|   `-- globals.css            # Global styles
|-- components/                # Shared navigation and session providers
|-- lib/
|   |-- auth.js                # NextAuth providers, callbacks, and session settings
|   `-- db.js                  # PostgreSQL setup, schema initialization, and memory fallback
|-- public/                    # Static assets
`-- package.json               # Scripts and dependencies
```

### MarketHub

```text
MULTI-VENDOR E-COMMERCE MARKETPLACE/
|-- frontend/
|   |-- src/app/               # Storefront and vendor dashboard routes
|   |-- src/components/        # Product, cart, checkout, compare, and tracking UI
|   |-- src/context/           # Shared marketplace/cart state
|   |-- src/services/          # API client and fallback mock data
|   |-- src/types/             # Marketplace TypeScript models
|   |-- public/                # Static assets
|   `-- package.json           # Next.js scripts and dependencies
`-- backend/backend/
    |-- src/
    |   |-- customer/          # Customer product, order, and tracking endpoints
    |   |-- vendor/            # Vendor product, inventory, order, and revenue endpoints
    |   |-- common/             # Guards, decorators, Redis cache, S3 adapter, and fallbacks
    |   |-- prisma/             # Prisma service/module
    |   |-- app.module.ts       # NestJS module registration
    |   `-- main.ts             # Port, CORS, and global /api prefix
    |-- prisma/schema.prisma   # PostgreSQL marketplace data model
    `-- package.json           # NestJS scripts and dependencies
```

## General Notes

- Start each application from its package directory; each `npm run dev` starts a separate local server.
- If port 3000 is already occupied, Next.js will usually select another available port. Use the URL printed in the terminal.
- Keep `.env` and `.env.local` files local. They may contain database credentials, authentication secrets, or provider credentials.
- The included sample data and fallback services are for development and do not replace production database, authentication, payment, or cloud-service configuration.
