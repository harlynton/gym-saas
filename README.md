# 📘 Gym SaaS — Monorepo

## 🚀 Descripción general

Gym SaaS es un sistema modular para administrar gimnasios, membresías, paquetes de tickets y clases.  
El proyecto está organizado como un **monorepo** usando **pnpm + turborepo**.

Incluye dos paquetes principales:

- **core-domain** → Dominio puro (entidades, value objects, repositorios e interfaces, casos de uso).
- **api** → API REST en **NestJS**, usando **Prisma ORM 7** con `PrismaPg`.

---

## 🗂️ Estructura del Monorepo

```
gym-saas/
│
├── apps/
│   └── api/
│       ├── src/
│       ├── prisma/
│       └── package.json
├── packages/
│   └── core-domain/
│       └── src/
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🔧 Configuración del Entorno

### 1. Archivo `.env`

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym_saas?schema=public"
```

### 2. `prisma.config.ts`

```ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 3. PrismaService (NestJS)

```ts
import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }

    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

---

## 🔄 Migraciones y Base de Datos

### Crear migración inicial

```
pnpm --filter @gym-saas/api exec prisma migrate dev --name init
```

### Regenerar cliente

```
pnpm --filter @gym-saas/api exec prisma generate
```

---

## ▶️ Ejecutar el API

Modo desarrollo:

```
pnpm --filter @gym-saas/api run start:dev
```

---

## 🌐 Endpoints REST expuestos

### 📌 Crear membresía — POST `/memberships`
```json
{
  "gymId": "G1",
  "userId": "U1",
  "planId": "P1",
  "startDate": "2025-01-01"
}
```

### 📌 Crear ticket pack — POST `/ticket-packs`
```json
{
  "gymId": "G1",
  "userId": "U1",
  "name": "10 clases spinning",
  "totalCredits": 10,
  "priceAmount": 50000,
  "priceCurrency": "COP"
}
```

---

## 🧪 Ejecutar tests

```
npx turbo test --filter=@gym-saas/api
```

---

## 🛠️ Tareas completadas recientemente

### 🔹 Integración de Prisma 7 con adaptador `PrismaPg`
- Se reemplazó el `datasource url` del schema por prisma.config.ts.
- Se creó `PrismaService` con soporte oficial para Prisma 7.

### 🔹 Creación de repositorios Prisma
- Memberships  
- Membership Plans  
- Ticket Packs  
- Gym Members  
Cada uno mapea entidades de dominio a modelos Prisma.

### 🔹 Exposición de endpoints REST en NestJS
- `/memberships`  
- `/ticket-packs`

### 🔹 Correcciones de monorepo
- Ajustes en `tsconfig.json` global y locales.  
- Corrección de paths y exports del dominio.  
- Se solucionó error de compilación por módulos CommonJS/Esm.

### 🔹 API levantando correctamente
- Se corrigió error de DATABASE_URL no detectado.  
- NestJS inicia sin errores y Prisma conecta correctamente.

---

## 🧩 Troubleshooting

| Problema | Solución |
|---------|----------|
| PrismaClientInitializationError | Revisar PrismaService y DATABASE_URL |
| TS2307 módulos no encontrados | Ejecutar `pnpm install` + `pnpm --filter @gym-saas/core-domain run build` |
| Prisma no ejecuta migraciones | Verificar `prisma.config.ts` |
| API no arranca | Confirmar `.env` cargado correctamente |

---

## 📄 Licencia
Proyecto privado — uso interno únicamente.

---

**Última actualización:** 05 de diciembre de 2025  
Creado automáticamente por ChatGPT.

