import { Router } from "express";
import { prisma } from "../../config/prisma";
import { auth, requireRole } from "../../middleware/auth";

const router = Router();

router.get("/", auth, requireRole("ADMIN"), async (_req, res) => {
  res.json(await prisma.inventory.findMany({ include: { product: true }, orderBy: { updatedAt: "desc" } }));
});

router.patch("/:productId", auth, requireRole("ADMIN"), async (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) return res.status(400).json({ message: "Invalid quantity" });
  res.json(await prisma.inventory.upsert({
    where: { productId },
    create: { productId, quantity },
    update: { quantity }
  }));
});

export default router;