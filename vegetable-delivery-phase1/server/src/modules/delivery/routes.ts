import { Router } from "express";
import { prisma } from "../../config/prisma";
import { auth } from "../../middleware/auth";

const router = Router();

const getSlots = async (_req: any, res: any) => {
  try {
    const slots = await prisma.deliverySlot.findMany({ where: { active: true }, orderBy: { id: "asc" } });
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Unable to fetch delivery slots" });
  }
};

router.get("/slots", getSlots);
router.get("/", getSlots);

export default router;