# 🏋️‍♂️ Gym SaaS Platform  
Monorepo para una plataforma SaaS multi-tenant para gimnasios, construida con **NestJS**, **Expo**, **Next.js**, **PNPM workspaces** y **TypeScript**.

Este proyecto permite a múltiples gimnasios gestionar:

- Mensualidades  
- Tiqueteras / paquetes de clases  
- Clases de spinning  
- Pagos y notificaciones  
- Control de clientes, entrenadores y administración  
- Panel web para entrenadores  
- App móvil para clientes

---

## 🚀 Tecnologías principales

### 🧩 **Monorepo**
- **PNPM Workspaces**
- **TypeScript**
- **Carpetas:**
  ```
  apps/
    api/         → Backend NestJS
    admin-web/   → Frontend admin (Next.js) [pendiente]
    mobile/      → App móvil (Expo / React Native)
  packages/
    core-domain/ → Dominio puro (entidades, casos de uso, repos)
  ```

### 🛠 **Backend API**
- **NestJS**
- Validaciones con `class-validator`
- Arquitectura por módulos
- Integración con el dominio sin acoplamiento
- Repositorios en memoria (por ahora)

### 🎨 **Frontend Admin**
- **Next.js 15** (Soon)
- Dashboard para entrenadores y dueños de gimnasio

### 📱 **App móvil**
- **Expo + React Native**  
- Clientes pueden:
  - comprar tiqueteras
  - pagar mensualidades
  - reservar spinning
  - ver su progreso y próximas clases

### 🧠 **Core Domain**
Código completamente independiente de frameworks:

- Entidades del dominio
- Repositorios (interfaces)
- Casos de uso:
  - `createMembership`
  - `createTicketPack`
  - `consumeTicketCredit`

---

## 📦 Estructura del proyecto

```
gym-saas/
│
├── apps/
│   ├── api/              # Backend NestJS
│   ├── admin-web/        # Panel web (Next.js)
│   └── mobile/           # App móvil (Expo)
│
└── packages/
    └── core-domain/      # Entidades, repos, casos de uso
```

---

## 🏃‍♂️ Cómo correr el proyecto

### 1. Instalar dependencias
Desde la raíz:

```bash
pnpm install
```

### 2. Levantar el backend

```bash
pnpm --filter @gym-saas/api run start:dev
```

La API quedará disponible en:

```
http://localhost:3000/
```

### 3. Levantar la app móvil (cuando esté configurada)
```bash
cd apps/mobile
pnpm start
```

### 4. Levantar el panel admin (cuando esté configurado)
```bash
cd apps/admin-web
pnpm dev
```

---

## 🧪 Casos de uso implementados

### ✔️ Memberships
- `createMembership`

### ✔️ Tiqueteras (Ticket Packs)
- `createTicketPack`
- `consumeTicketCredit`

Todos están integrados con el backend Nest a través de:

- `TicketPacksService`
- `MembershipsService`

---

## 📡 Endpoints disponibles (API)

### Crear tiquetera
```
POST /gyms/:gymId/ticket-packs
```

### Consumir crédito
```
POST /gyms/:gymId/ticket-packs/:ticketPackId/consume
```

### Crear membresía
```
POST /gyms/:gymId/memberships
```

---

## 🧱 Próximos pasos

- [ ] Implementar repositorios reales con **Prisma + PostgreSQL**
- [ ] Módulo de **Spinning Classes** y reservas
- [ ] Crear **admin-web** (Next.js 15)
- [ ] Crear **app móvil** (Expo + React Native)
- [ ] Autenticación y multi-tenancy por gimnasio
- [ ] Integración con plataformas de pago (Wompi / MercadoPago)
- [ ] Notificaciones push para clientes y entrenadores

---

## ❤️ Contribución

Este proyecto está diseñado para escalar a múltiples gimnasios.  
Sientete libre de enviar ideas, mejoras o abrir issues para nuevas funcionalidades.

---

## 📄 Licencia

MIT — libre para uso personal y comercial.
