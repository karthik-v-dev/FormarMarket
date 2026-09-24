import { CustomerTier } from '../types';

export interface TierInfo {
  tier: CustomerTier;
  label: string;
  badge: string;
  discountPercentage: number;
  minMonthlyOrders: number;
  maxMonthlyOrders: number | null;
  themeColor: string;
  badgeBg: string;
  badgeTextColor: string;
  nextTierGoal?: {
    nextTier: CustomerTier;
    ordersNeeded: number;
    nextDiscount: number;
  };
}

/**
 * Calculates customer loyalty tier based on monthly order count:
 * - Normal: 0-1 orders/month -> 0% discount
 * - Silver: 2-3 orders/month -> 8% discount
 * - Gold: 4-6 orders/month -> 15% discount
 * - Platinum: >6 orders/month -> 20% discount
 */
export function calculateTier(monthlyOrderCount: number): CustomerTier {
  if (monthlyOrderCount > 6) return 'platinum';
  if (monthlyOrderCount >= 4) return 'gold';
  if (monthlyOrderCount >= 2) return 'silver';
  return 'normal';
}

export function getTierInfo(tier: CustomerTier, monthlyOrderCount: number = 0): TierInfo {
  switch (tier) {
    case 'platinum':
      return {
        tier: 'platinum',
        label: 'Platinum Member',
        badge: '💎 PLATINUM MEMBER • 20% OFF APPLIED',
        discountPercentage: 20,
        minMonthlyOrders: 7,
        maxMonthlyOrders: null,
        themeColor: '#7C3AED',
        badgeBg: '#EDE9FE',
        badgeTextColor: '#5B21B6',
      };
    case 'gold':
      return {
        tier: 'gold',
        label: 'Gold Member',
        badge: '👑 GOLD MEMBER • 15% OFF APPLIED',
        discountPercentage: 15,
        minMonthlyOrders: 4,
        maxMonthlyOrders: 6,
        themeColor: '#D97706',
        badgeBg: '#FEF3C7',
        badgeTextColor: '#92400E',
        nextTierGoal: {
          nextTier: 'platinum',
          ordersNeeded: Math.max(1, 7 - monthlyOrderCount),
          nextDiscount: 20,
        },
      };
    case 'silver':
      return {
        tier: 'silver',
        label: 'Silver Member',
        badge: '🥈 SILVER MEMBER • 8% OFF APPLIED',
        discountPercentage: 8,
        minMonthlyOrders: 2,
        maxMonthlyOrders: 3,
        themeColor: '#4B5563',
        badgeBg: '#F3F4F6',
        badgeTextColor: '#1F2937',
        nextTierGoal: {
          nextTier: 'gold',
          ordersNeeded: Math.max(1, 4 - monthlyOrderCount),
          nextDiscount: 15,
        },
      };
    case 'normal':
    default:
      return {
        tier: 'normal',
        label: 'Standard Member',
        badge: '🌱 REGULAR MEMBER • ORDER 2 TO UNLOCK 8% OFF',
        discountPercentage: 0,
        minMonthlyOrders: 0,
        maxMonthlyOrders: 1,
        themeColor: '#0C831F',
        badgeBg: '#E8F7EC',
        badgeTextColor: '#065F14',
        nextTierGoal: {
          nextTier: 'silver',
          ordersNeeded: Math.max(1, 2 - monthlyOrderCount),
          nextDiscount: 8,
        },
      };
  }
}

export interface CartCalculation {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
}

/**
 * Calculates cart pricing live with tier discount and delivery fee rule:
 * - Free delivery for subtotal >= ₹199, else ₹25
 */
export function calculateCartSummary(
  subtotal: number,
  tier: CustomerTier
): CartCalculation {
  const tierInfo = getTierInfo(tier);
  const discountPercentage = tierInfo.discountPercentage;
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  // Quick-commerce delivery rule
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 199 ? 0 : 25;
  const totalAmount = discountedSubtotal + deliveryFee;

  return {
    subtotal,
    discountPercentage,
    discountAmount,
    deliveryFee,
    totalAmount,
  };
}
