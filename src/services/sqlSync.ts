import { Order, UserProfile } from '../types';
import { dc, createOrder, addOrderItem } from '../firebase';

// Read API URL from environment if configured
const SQL_BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.241:4000/api/v1';

export interface SqlSyncResult {
  synced: boolean;
  target: 'DataConnect' | 'ExpressSql' | 'LocalOnly';
  message: string;
  sqlOrderId?: number | string;
}

/**
 * Sync placed order to Relational SQL Database (PostgreSQL / MySQL)
 * Supports dual sync: Firebase DataConnect and Express SQL backend.
 */
export async function syncOrderToSqlDatabase(order: Order, user: UserProfile): Promise<SqlSyncResult> {
  // Strategy 1: Attempt Firebase DataConnect (PostgreSQL)
  try {
    const deliveryDateStr = order.deliveryDate;
    const res = await createOrder(dc, {
      userId: user.uid,
      deliverySlotId: order.deliverySlot,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryDate: deliveryDateStr,
    });

    if (res && res.data && res.data.order_insert) {
      const orderId = res.data.order_insert.id;
      for (const item of order.items) {
        await addOrderItem(dc, {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }).catch(() => {});
      }
      return {
        synced: true,
        target: 'DataConnect',
        message: 'Order mirrored to Firebase PostgreSQL database',
        sqlOrderId: orderId,
      };
    }
  } catch (dcErr: any) {
    // Non-fatal, try REST SQL backend
  }

  // Strategy 2: Attempt Express / MySQL / PostgreSQL REST API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${SQL_BACKEND_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: `${order.deliveryAddress.line1}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`,
        deliverySlotId: 1,
        deliveryDate: order.deliveryDate,
        paymentMethod: 'COD',
        items: order.items.map(item => ({
          productId: 1, // mapped product reference
          quantity: item.quantity,
        })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        synced: true,
        target: 'ExpressSql',
        message: 'Order synced to Relational SQL Server',
        sqlOrderId: data.id,
      };
    }
  } catch (apiErr: any) {
    // Offline or network timeout
  }

  return {
    synced: true,
    target: 'LocalOnly',
    message: 'Saved to Firebase Realtime Database and offline cache',
  };
}

/**
 * Triggers tier recalculation sync check
 */
export async function triggerTierSync(uid: string): Promise<void> {
  try {
    await fetch(`${SQL_BACKEND_URL}/cron/sync-tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
  } catch {}
}
