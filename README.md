# 🏋️‍♂️ Gym SaaS — Monorepo

# 🚀 Gym SaaS — Monorepo  
Plataforma modular para administración de gimnasios, construida con arquitectura limpia, dominio desacoplado y backend escalable.

Este monorepo contiene:

- **Core Domain** (DDD puro)
- **API Backend** (NestJS + Prisma 7)
- **Admin Web** (Next.js)
- **Mobile App** (React Native)
- **Shared Types** y **UI Kit**
- **Turborepo + PNPM Workspaces**

---

# 🧩 Tecnologías principales

| Capa | Tecnología |
|------|------------|
| Workspace | Turborepo + PNPM |
| Dominio | TypeScript DDD |
| Backend | NestJS 11 |
| BD | PostgreSQL 16 |
| ORM | Prisma 7 |
| Infra | Docker Compose |
| Tests | Jest 30 |

---

# 📁 Estructura del Monorepo

```
gym-saas/
│
├── apps/
│   ├── api/
│   ├── admin-web/
│   └── mobile/
│
├── packages/
│   ├── core-domain/
│   ├── shared-types/
│   └── ui-kit/
│
├── prisma.config.ts
├── docker-compose.yml
├── pnpm-workspace.yaml
└── turbo.json
```

---

# 🧬 Prisma 7 — Configuración

### **apps/api/prisma.config.ts**

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

---

# 🗄️ Base de Datos (PostgreSQL + Docker)

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: gym_saas_postgres
    environment:
      POSTGRES_DB: gym_saas
      POSTGRES_USER: gym_saas
      POSTGRES_PASSWORD: gym_saas
    ports:
      - "5432:5432"
    volumes:
      - pgdata_gym_saas:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata_gym_saas:
```

Levantar Postgres:

```bash
docker compose up -d
```

---

# 🔌 Variables de entorno

### apps/api/.env

```env
DATABASE_URL="postgresql://gym_saas:gym_saas@localhost:5432/gym_saas?schema=public"
```

---

# 🧱 Migraciones

```bash
pnpm --filter @gym-saas/api exec prisma migrate dev --name init_gym_saas
pnpm --filter @gym-saas/api exec prisma generate
```

---

# 🔧 Integración NestJS + Prisma

### prisma.service.ts

```ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### prisma.module.ts

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### app.module.ts

```ts
@Module({
  imports: [
    PrismaModule,
    MembershipsModule,
    TicketPacksModule,
  ],
})
export class AppModule {}
```

---

# 🧪 Testing del dominio

```bash
npx turbo test --filter=@gym-saas/core-domain
```

---

# 🛠️ Scripts útiles

```bash
pnpm --filter @gym-saas/api dev
pnpm --filter @gym-saas/admin-web dev
pnpm --filter @gym-saas/core-domain test
```

---

# ✔ Requisitos

| Dependencia | Versión mínima |
|------------|----------------|
| NodeJS | 20.19+ |
| PNPM | 9+ |
| Docker | recomendado |

---

# 📌 Estado del proyecto

✔ Dominio completo  
✔ Tests funcionando  
✔ Prisma 7 configurado  
✔ Migraciones OK  
✔ NestJS integrado  

⏳ Repositorios Prisma por implementar  
⏳ Endpoints REST por completar
