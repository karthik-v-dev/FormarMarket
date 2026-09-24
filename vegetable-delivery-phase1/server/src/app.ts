import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/routes";
import productRoutes from "./modules/products/routes";
import inventoryRoutes from "./modules/inventory/routes";
import orderRoutes from "./modules/orders/routes";
import deliveryRoutes from "./modules/delivery/routes";
import cronRoutes from "./modules/cron/tierUpdateCron";

export const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
app.use(express.json());

app.get("/api/v1/health", (_req, res) => res.json({ ok: true, service: "vegetable-delivery-api" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/delivery-slots", deliveryRoutes);
app.use("/api/v1/cron", cronRoutes);