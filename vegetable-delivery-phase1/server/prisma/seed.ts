import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  await prisma.user.upsert({
    where: { email: "admin@vegetableapp.local" },
    update: {},
    create: { name: "Admin", email: "admin@vegetableapp.local", passwordHash, role: Role.ADMIN }
  });

  const slots = [
    { name: "Morning", startTime: "07:00", endTime: "10:00", capacity: 50 },
    { name: "Afternoon", startTime: "12:00", endTime: "15:00", capacity: 50 },
    { name: "Evening", startTime: "17:00", endTime: "20:00", capacity: 50 }
  ];
  for (const slot of slots) await prisma.deliverySlot.upsert({
    where: { id: slots.indexOf(slot) + 1 }, update: slot, create: slot
  });

  const products = [
    ["Tomato", "Fresh red tomatoes", 60, "kg", 100],
    ["Potato", "Fresh potatoes", 45, "kg", 100],
    ["Onion", "Fresh onions", 50, "kg", 100],
    ["Carrot", "Fresh carrots", 70, "kg", 80],
    ["Spinach", "Fresh spinach", 30, "bundle", 60]
  ] as const;

  for (const [name, description, price, unit, quantity] of products) {
    const p = await prisma.product.upsert({
      where: { id: products.indexOf(products.find(x => x[0] === name)!) + 1 },
      update: { name, description, price, unit, isActive: true },
      create: { name, description, price, unit }
    });
    await prisma.inventory.upsert({
      where: { productId: p.id }, update: { quantity }, create: { productId: p.id, quantity }
    });
  }
}

main().finally(() => prisma.$disconnect());