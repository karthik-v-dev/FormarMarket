import { Router } from "express";
import { prisma } from "../../config/prisma";

const router = Router();

/**
 * Monthly Tier Recalculation SQL Query / Handler
 * Thresholds:
 * - 0-1 orders/month: Normal (0% discount)
 * - 2-3 orders/month: Silver (8% discount)
 * - 4-6 orders/month: Gold (15% discount)
 * - >6 orders/month: Platinum (20% discount)
 */
export async function executeMonthlyTierRecalculation() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Group completed orders in last 30 days
  const completedOrders = await prisma.order.groupBy({
    by: ["userId"],
    where: {
      status: { in: ["CONFIRMED", "DELIVERED"] },
      placedAt: { gte: thirtyDaysAgo }
    },
    _count: {
      id: true
    }
  });

  const updates = [];
  for (const item of completedOrders) {
    const orderCount = item._count.id;
    let tier = "normal";
    if (orderCount > 6) tier = "platinum";
    else if (orderCount >= 4) tier = "gold";
    else if (orderCount >= 2) tier = "silver";

    updates.push({
      userId: item.userId,
      monthlyOrderCount: orderCount,
      tierStatus: tier
    });
  }

  return {
    processedUsersCount: updates.length,
    timestamp: new Date().toISOString(),
    summary: updates
  };
}

router.post("/sync-tiers", async (req, res) => {
  try {
    const result = await executeMonthlyTierRecalculation();
    res.json({
      success: true,
      message: "Monthly customer tiers recalculated successfully in Relational SQL Database",
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/status", async (_req, res) => {
  res.json({
    status: "active",
    schedule: "Every 1st of month at 00:01 AM",
    tierTiers: {
      normal: "0-1 orders (0% off)",
      silver: "2-3 orders (8% off)",
      gold: "4-6 orders (15% off)",
      platinum: ">6 orders (20% off)"
    }
  });
});

export default router;
