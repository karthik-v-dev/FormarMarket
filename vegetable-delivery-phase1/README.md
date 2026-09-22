# Vegetable Delivery App — Phase 1

Backend starter for a next-day vegetable ordering application.

## Stack
- Node.js + Express + TypeScript
- MySQL
- Prisma
- JWT authentication
- Zod validation

## Setup

1. Create a MySQL database:
   `CREATE DATABASE vegetable_delivery;`

2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.

3. Install:
   `npm install`

4. Generate Prisma client:
   `npm run prisma:generate`

5. Create database tables:
   `npm run prisma:migrate`

6. Seed demo data:
   `npm run prisma:seed`

7. Start:
   `npm run dev`

Health:
`GET /api/v1/health`

Demo admin:
`admin@vegetableapp.local`
`Admin@12345`

Do not use the demo admin password in production.

## Main endpoints

POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/products
GET  /api/v1/delivery/slots
POST /api/v1/orders
GET  /api/v1/orders
GET  /api/v1/orders/:id
GET  /api/v1/inventory          (admin)
PATCH /api/v1/inventory/:productId (admin)

The payment integration is intentionally not connected yet. The API creates a pending payment for UPI/CARD and completes COD orders. A production gateway and webhook verification should be added in Phase 2.
