import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Order, OrderStatus } from '../../types';
import { subscribeToOrders, updateOrderStatus } from '../../services/firebaseRtdb';
import { getTierInfo } from '../../utils/tierCalculator';
import { getProductImageUrl } from '../../utils/unsplashImages';

interface OrderFeedProps {
  onBackToCustomerView: () => void;
}

export const OrderFeed: React.FC<OrderFeedProps> = ({ onBackToCustomerView }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    const unsub = subscribeToOrders(list => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err: any) {
      Alert.alert('Status Update Failed', err.message);
    }
  };

  const filteredOrders = orders.filter(
    o => selectedFilter === 'all' || o.status === selectedFilter
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ Live COD Order Feed</Text>
          <Text style={styles.headerSub}>Morning Farm Dispatch Desk</Text>
        </View>
        <Pressable style={styles.previewBtn} onPress={onBackToCustomerView}>
          <Text style={styles.previewBtnText}>🛒 Customer View</Text>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(
          [
            { id: 'all', label: 'All Orders' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'DISPATCHED', label: 'Dispatched' },
            { id: 'DELIVERED', label: 'Delivered' },
          ] as const
        ).map(tab => (
          <Pressable
            key={tab.id}
            style={[
              styles.filterTab,
              selectedFilter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(tab.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0C831F" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const tierInfo = getTierInfo(item.customerTier);

            return (
              <View style={styles.orderCard}>
                {/* Order Top Line */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
                    <Text style={styles.customerName}>
                      {item.customerName} • {item.customerPhone}
                    </Text>
                  </View>

                  {/* Customer Category Tag */}
                  <View
                    style={[
                      styles.tierBadge,
                      { backgroundColor: tierInfo.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tierBadgeText,
                        { color: tierInfo.badgeTextColor },
                      ]}
                    >
                      {tierInfo.label.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Delivery Time Slot Banner */}
                <View style={styles.slotBanner}>
                  <Text style={styles.slotIcon}>⏰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotTitle}>Next-Day Morning Delivery</Text>
                    <Text style={styles.slotTimeText}>
                      📅 {item.deliveryDate} • {item.deliverySlot}
                    </Text>
                  </View>
                  <View style={styles.codTag}>
                    <Text style={styles.codTagText}>COD ONLY</Text>
                  </View>
                </View>

                {/* Address Box */}
                <View style={styles.addressBox}>
                  <Text style={styles.addressTitle}>
                    📍 {item.deliveryAddress?.tag || 'Home'}: {item.deliveryAddress?.line1}
                  </Text>
                  {item.deliveryAddress?.line2 ? (
                    <Text style={styles.addressSub}>{item.deliveryAddress.line2}</Text>
                  ) : null}
                  <Text style={styles.addressSub}>
                    {item.deliveryAddress?.city} – {item.deliveryAddress?.pincode}
                  </Text>
                </View>

                {/* Item Breakdown */}
                <View style={styles.itemsBox}>
                  <Text style={styles.itemsBoxTitle}>ITEMS BREAKDOWN</Text>
                  {item.items.map((prod, idx) => (
                    <View style={styles.itemRow} key={`${prod.productId}_${idx}`}>
                      <Image
                        source={{ uri: getProductImageUrl(prod.imageUrl) }}
                        style={styles.itemThumb}
                      />
                      <Text style={styles.itemName} numberOfLines={1}>
                        {prod.name}
                      </Text>
                      <Text style={styles.itemQty}>
                        {prod.quantity} × {prod.unit}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₹{prod.quantity * prod.unitPrice}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Price & Action Row */}
                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.payableLabel}>Collect Cash Amount:</Text>
                    <Text style={styles.payableAmount}>₹{item.totalAmount}</Text>
                    {item.discountAmount > 0 && (
                      <Text style={styles.tierDiscountSub}>
                        Includes ₹{item.discountAmount} tier loyalty deduction
                      </Text>
                    )}
                  </View>

                  {/* Order Status Action Stepper */}
                  <View style={styles.actionBtnGroup}>
                    {item.status === 'CONFIRMED' && (
                      <Pressable
                        style={[styles.statusActionBtn, { backgroundColor: '#4338CA' }]}
                        onPress={() => handleUpdateStatus(item.id, 'DISPATCHED')}
                      >
                        <Text style={styles.statusActionText}>Mark Dispatched</Text>
                      </Pressable>
                    )}
                    {item.status === 'DISPATCHED' && (
                      <Pressable
                        style={[styles.statusActionBtn, { backgroundColor: '#0C831F' }]}
                        onPress={() => handleUpdateStatus(item.id, 'DELIVERED')}
                      >
                        <Text style={styles.statusActionText}>Mark Delivered</Text>
                      </Pressable>
                    )}
                    {item.status === 'DELIVERED' && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>✓ Delivered & Collected</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No orders in this filter</Text>
              <Text style={styles.emptySub}>
                Customer COD orders placed before 10:00 PM will appear here live.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  previewBtn: {
    backgroundColor: '#E8F7EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0C831F',
  },
  previewBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
  },
  filterTabActive: {
    backgroundColor: '#0C831F',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  customerName: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  slotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  slotIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  slotTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F14',
  },
  slotTimeText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '700',
    marginTop: 1,
  },
  codTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  addressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  addressSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  itemsBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 8,
    marginBottom: 10,
  },
  itemsBoxTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemThumb: {
    width: 28,
    height: 28,
    borderRadius: 4,
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  itemQty: {
    fontSize: 11,
    color: '#4B5563',
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payableLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  payableAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0C831F',
  },
  tierDiscountSub: {
    fontSize: 9,
    color: '#D97706',
    fontWeight: '700',
  },
  actionBtnGroup: {
    flexDirection: 'row',
  },
  statusActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
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
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
