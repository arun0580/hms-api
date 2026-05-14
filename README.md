# HMS API

Hospital Management System backend — **Express 4 + TypeScript + Prisma + PostgreSQL**.

## Stack

- **Runtime:** Node.js (>=18)
- **Framework:** Express 4
- **Language:** TypeScript (ESM, NodeNext)
- **ORM:** Prisma 6 (PostgreSQL)
- **Auth:** JWT (`jsonwebtoken`) + bcryptjs
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan + tiny custom logger

## Folder structure

```
hms-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── config/         # env loader, prisma client
    ├── controllers/    # HTTP layer (parses request, returns response)
    ├── middleware/     # auth + error middleware
    ├── routes/         # route registrations
    ├── services/       # business logic (db calls, hashing, JWT)
    ├── utils/          # logger, HttpError, asyncHandler
    ├── app.ts          # Express app factory
    └── index.ts        # bootstrap (db connect, listen, shutdown)
```

## Setup

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env

# 3. Make sure Postgres is up (see ../hms-docker)
#    cd ../hms-docker && docker compose up -d

# 4. Apply schema and seed default user
npm run prisma:migrate -- --name init
npm run db:seed
```

## Scripts

| Command                  | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start API with `tsx watch` (hot reload)      |
| `npm run start:dev`      | Alias for `npm run dev` (Nest-style name)    |
| `npm run build`          | Compile TS to `dist/`                        |
| `npm start`              | Run compiled JS                              |
| `npm run start:prod`     | Alias for `npm start`                        |
| `npm run prisma:migrate` | Create + apply a new migration in dev        |
| `npm run prisma:deploy`  | Apply existing migrations (production)       |
| `npm run prisma:studio`  | Open Prisma Studio                           |
| `npm run db:seed`        | Insert the default admin user                |
| `npm run lint`           | ESLint over `src/`                           |

## Default credentials

After seeding:

- **Email:** `admin@hms.com`
- **Password:** `123456`

## API endpoints

| Method | Path             | Auth      | Description                      |
| ------ | ---------------- | --------- | -------------------------------- |
| GET    | `/api/health`    | public    | Health check                     |
| POST   | `/api/auth/login`| public    | Email/password login → JWT       |
| GET    | `/api/user/me`   | Bearer JWT| Returns the current user profile |

### Login example

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hms.com","password":"123456"}'
```

Response:

```json
{
  "token": "<jwt>",
  "user": { "id": "...", "name": "HMS Admin", "email": "admin@hms.com", "role": "ADMIN", "createdAt": "..." }
}
```
