import { Router } from "express";
import { prisma } from "../../config/prisma";
import { auth, AuthRequest } from "../../middleware/auth";
import { z } from "zod";

const router = Router();

const orderSchema = z.object({
  addressId: z.coerce.number().int().positive().optional(),
  address: z.string().optional(),
  slotId: z.coerce.number().int().positive().optional(),
  deliverySlotId: z.coerce.number().int().positive().optional(),
  deliveryDate: z.string().optional(),
  paymentMethod: z.enum(["UPI", "CARD", "COD"]).default("COD"),
  items: z.array(z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().positive()
  })).min(1)
});

router.post("/", auth, async (req: AuthRequest, res) => {
  try {
    const body = orderSchema.parse(req.body);
    const resolvedSlotId = body.slotId ?? body.deliverySlotId;
    if (!resolvedSlotId) {
      return res.status(400).json({ message: "Delivery slot is required" });
    }

    let deliveryDateStr = body.deliveryDate;
    if (!deliveryDateStr) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      deliveryDateStr = tomorrow.toISOString().split("T")[0];
    }
    const deliveryDate = new Date(`${deliveryDateStr}T00:00:00.000Z`);

    const order = await prisma.$transaction(async (tx) => {
      let addressId = body.addressId;
      if (!addressId) {
        if (!body.address) throw new Error("Address is required");
        const existingAddr = await tx.address.findFirst({ where: { userId: req.user!.id } });
        if (existingAddr) {
          addressId = existingAddr.id;
        } else {
          const createdAddr = await tx.address.create({
            data: {
              userId: req.user!.id,
              line1: body.address,
              city: "Local",
              state: "Default",
              pincode: "100001"
            }
          });
          addressId = createdAddr.id;
        }
      }

      const address = await tx.address.findFirst({ where: { id: addressId, userId: req.user!.id } });
      if (!address) throw new Error("Address not found");

      const slot = await tx.deliverySlot.findFirst({ where: { id: resolvedSlotId, active: true } });
      if (!slot) throw new Error("Delivery slot not found");

      const existing = await tx.order.count({ where: { deliveryDate, slotId: slot.id, status: { not: "CANCELLED" } } });
      if (existing >= slot.capacity) throw new Error("Delivery slot is full");

      const ids = body.items.map(i => i.productId);
      const products = await tx.product.findMany({ where: { id: { in: ids }, isActive: true }, include: { inventory: true } });
      if (products.length !== ids.length) throw new Error("One or more products are unavailable");

      let total = 0;
      for (const item of body.items) {
        const product = products.find(p => p.id === item.productId)!;
        const stock = Number(product.inventory?.quantity ?? 0);
        if (stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
        total += Number(product.price) * item.quantity;
      }

      const created = await tx.order.create({
        data: {
          userId: req.user!.id,
          addressId: addressId,
          slotId: resolvedSlotId,
          deliveryDate,
          totalAmount: total,
          status: body.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
          items: { create: body.items.map(i => {
            const p = products.find(x => x.id === i.productId)!;
            return { productId: i.productId, quantity: i.quantity, unitPrice: p.price };
          })},
          payment: { create: { amount: total, method: body.paymentMethod, status: body.paymentMethod === "COD" ? "COMPLETED" : "PENDING", paidAt: body.paymentMethod === "COD" ? new Date() : null } }
        },
        include: { items: true, payment: true }
      });

      for (const item of body.items) {
        await tx.inventory.update({ where: { productId: item.productId }, data: { quantity: { decrement: item.quantity } } });
      }
      return created;
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to create order" });
  }
});

router.get("/", auth, async (req: AuthRequest, res) => {
  res.json(await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } }, address: true, slot: true, payment: true, delivery: true },
    orderBy: { placedAt: "desc" }
  }));
});

router.get("/:id", auth, async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: Number(req.params.id), userId: req.user!.id },
    include: { items: { include: { product: true } }, address: true, slot: true, payment: true, delivery: true }
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

export default router;