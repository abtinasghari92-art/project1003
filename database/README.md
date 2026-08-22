# Database

PostgreSQL lives on Liara in production and in `docker-compose.yml` locally.

The Prisma schema and migrations are owned by the Core API:

- Schema: [`apps/api/prisma/schema.prisma`](../apps/api/prisma/schema.prisma)
- Seed: [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts)

```bash
docker compose up -d postgres
cp .env.example apps/api/.env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```
