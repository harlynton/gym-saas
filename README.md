# 🏋️‍♂️ Gym SaaS --- Monorepo

Este proyecto es un **SaaS para gimnasios**, construido con:

-   **NestJS** --- API REST
-   **Prisma ORM + PostgreSQL**
-   **Core-Domain (DDD, casos de uso puros)**
-   **TurboRepo + pnpm workspaces**
-   **Node 20.19.0**

------------------------------------------------------------------------

## 📦 Estructura del Monorepo

    gym-saas/
    │
    ├── apps/
    │   └── api/                     # API con NestJS
    │
    ├── packages/
    │   └── core-domain/             # Entidades, repositorios, casos de uso
    │
    ├── prisma/                      # Migraciones del API
    └── ...

------------------------------------------------------------------------

## 🔧 Configuración Inicial

### 1. Instalar dependencias

``` bash
pnpm install
```

### 2. Crear el archivo `.env` en `apps/api`

    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gym_saas"
    PORT=3000

------------------------------------------------------------------------

## 🛢 Base de datos PostgreSQL en Docker

Crear el contenedor:

``` bash
docker run --name gym-postgres   -e POSTGRES_PASSWORD=postgres   -e POSTGRES_DB=gym_saas   -p 5432:5432   -d postgres
```

------------------------------------------------------------------------

## 🧩 Configuración de Prisma ORM

### Migrar la base de datos

``` bash
pnpm --filter @gym-saas/api exec prisma migrate dev --name init
```

### Abrir Prisma Studio

``` bash
pnpm --filter @gym-saas/api exec prisma studio
```

------------------------------------------------------------------------

## 🌱 Sembrado inicial de datos

``` sql
INSERT INTO "Gym" (id, name, "createdAt", "updatedAt")
VALUES ('demo-gym', 'Demo Gym', NOW(), NOW());

INSERT INTO "User" (id, email, name, "createdAt", "updatedAt")
VALUES ('demo-user', 'demo@gym.com', 'Demo User', NOW(), NOW());

INSERT INTO "GymMember" (id, "gymId", "userId", "isActive", "createdAt", "updatedAt")
VALUES ('demo-member', 'demo-gym', 'demo-user', true, NOW(), NOW());

INSERT INTO "MembershipPlan" (
  id, "gymId", name, "durationDays",
  "priceAmount", "priceCurrency",
  "createdAt", "updatedAt"
) VALUES (
  'plan-1', 'demo-gym', 'Mensual', 30,
  100000, 'COP',
  NOW(), NOW()
);
```

------------------------------------------------------------------------

## 🔥 Endpoints REST Actuales

### 📌 Crear Membership

**POST /memberships**

``` json
{
  "gymId": "demo-gym",
  "userId": "demo-user",
  "membershipPlanId": "plan-1"
}
```

### 📌 Crear Ticket Pack

**POST /ticket-packs**

``` json
{
  "gymId": "demo-gym",
  "userId": "demo-user",
  "name": "10 clases spinning",
  "totalCredits": 10,
  "priceAmount": 20000,
  "priceCurrency": "COP"
}
```

------------------------------------------------------------------------

## 🧪 Pruebas del dominio

``` bash
npx turbo test --filter=@gym-saas/core-domain
```

------------------------------------------------------------------------

## 🚀 Ejecutar API en modo desarrollo

``` bash
pnpm --filter @gym-saas/api run start:dev
```

La API queda disponible en:\
👉 **http://localhost:3000**

------------------------------------------------------------------------

## ✔️ Cambios añadidos hoy

-   Se corrigió la configuración de Prisma 7
-   Se creó `PrismaService` compatible con el nuevo sistema de
    `PrismaClientOptions`
-   Se añadieron repositorios Prisma para Memberships, Ticket Packs y
    Gym Members
-   Se activó el módulo de NestJS para exponer endpoints REST reales
-   Se solucionó el problema de imports entre `core-domain` y `api`
-   Se probó y ejecutó la API correctamente contra PostgreSQL real

------------------------------------------------------------------------

## 🧭 Próximos pasos sugeridos

1.  Agregar autenticación JWT
2.  Crear endpoints GET para listar memberships y ticket packs
3.  Implementar sistema de reservas de spinning
4.  Crear pruebas E2E en NestJS
5.  Despliegue en Render / Railway

------------------------------------------------------------------------
