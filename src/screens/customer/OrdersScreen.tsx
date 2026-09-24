import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Order, UserProfile } from '../../types';
import { subscribeToOrders } from '../../services/firebaseRtdb';
import { getProductImageUrl } from '../../utils/unsplashImages';

interface OrdersScreenProps {
  user: UserProfile;
  onBack: () => void;
  onGoToShop: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  user,
  onBack,
  onGoToShop,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOrders(allOrders => {
      // Filter orders for current user
      const userOrders = allOrders.filter(
        o => o.userId === user.uid || !o.userId // show demo orders as well
      );
      setOrders(userOrders);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'DISPATCHED':
        return { bg: '#E0E7FF', text: '#4338CA' };
      case 'CONFIRMED':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0C831F" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 40 + Math.max(insets.bottom, 12) },
          ]}
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            return (
              <View style={styles.orderCard}>
                {/* Order Top Bar */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{item.id.slice(-6)}</Text>
                    <Text style={styles.placedDate}>
                      {new Date(item.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusStyle.text },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Delivery Slot Indicator */}
                <View style={styles.deliverySlotBanner}>
                  <Text style={styles.slotIcon}>⚡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotTitle}>Next-Day Morning Delivery</Text>
                    <Text style={styles.slotDetails}>
                      📅 {item.deliveryDate} • ⏰ {item.deliverySlot}
                    </Text>
                  </View>
                </View>

                {/* Items Summary */}
                <View style={styles.itemsContainer}>
                  {item.items.map((prod, idx) => (
                    <View style={styles.itemRow} key={`${prod.productId}_${idx}`}>
                      <Image
                        source={{
                          uri: getProductImageUrl(prod.imageUrl),
                        }}
                        style={styles.itemThumb}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {prod.name}
                        </Text>
                        <Text style={styles.itemMeta}>
                          {prod.quantity} × {prod.unit} @ ₹{prod.unitPrice}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        ₹{prod.quantity * prod.unitPrice}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total & Payment */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.paymentMethod}>💵 Cash on Delivery (COD)</Text>
                    {item.discountAmount > 0 && (
                      <Text style={styles.savingsText}>
                        Saved ₹{item.discountAmount} with {item.customerTier.toUpperCase()} Tier
                      </Text>
                    )}
                  </View>
                  <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySub}>
                Your organic vegetable deliveries will show up here.
              </Text>
              <Pressable style={styles.shopBtn} onPress={onGoToShop}>
                <Text style={styles.shopBtnText}>Browse Farm Fresh</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 6,
  },
  backIcon: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  placedDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deliverySlotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  slotIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  slotTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F14',
  },
  slotDetails: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginTop: 1,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemThumb: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  paymentMethod: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C831F',
  },
  savingsText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  shopBtn: {
    backgroundColor: '#0C831F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
