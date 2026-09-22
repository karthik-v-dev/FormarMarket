import { Router } from "express";
import { prisma } from "../../config/prisma";
import { auth, requireRole } from "../../middleware/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { inventory: true },
    orderBy: { name: "asc" }
  });
  res.json(products);
});

router.post("/", auth, requireRole("ADMIN"), async (req, res) => {
  const { name, description, price, imageUrl, unit, quantity = 0 } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price, imageUrl, unit, inventory: { create: { quantity } } },
    include: { inventory: true }
  });
  res.status(201).json(product);
});

export default router;