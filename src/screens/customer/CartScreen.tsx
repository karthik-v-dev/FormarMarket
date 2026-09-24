import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { CartItem, UserProfile, Product } from '../../types';
import { calculateCartSummary, getTierInfo } from '../../utils/tierCalculator';
import { checkOrderCutoff, MORNING_DELIVERY_SLOTS } from '../../utils/timeCutoff';
import { getProductImageUrl } from '../../utils/unsplashImages';
import { placeOrder } from '../../services/firebaseRtdb';
import { syncOrderToSqlDatabase } from '../../services/sqlSync';

interface CartScreenProps {
  cart: CartItem[];
  user: UserProfile;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onClearCart: () => void;
  onBackToShop: () => void;
  onOpenAddresses: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cart,
  user,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onBackToShop,
  onOpenAddresses,
  onOrderSuccess,
}) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(MORNING_DELIVERY_SLOTS[0].id);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  const activeAddress =
    user.addresses[user.activeAddressId] || Object.values(user.addresses)[0];

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const calculation = calculateCartSummary(rawSubtotal, user.tierStatus);
  const tierInfo = getTierInfo(user.tierStatus, user.monthlyOrderCount);
  const cutoff = checkOrderCutoff();

  const handlePlaceOrder = async () => {
    // 1. Check cutoff rule: strictly up to 10:00 PM IST
    const liveCutoff = checkOrderCutoff();
    if (!liveCutoff.isOpen) {
      Alert.alert(
        '🌙 Orders Closed for Today',
        `${liveCutoff.message}\n\nPlease place your order tomorrow between 6:00 AM and 10:00 PM IST for next-day morning harvest.`,
        [{ text: 'Understand' }]
      );
      return;
    }

    // 2. Validate Address
    if (!activeAddress) {
      Alert.alert('Missing Address', 'Please select or add a delivery address.', [
        { text: 'Add Address', onPress: onOpenAddresses },
      ]);
      return;
    }

    // 3. Validate Cart
    if (cart.length === 0) {
      Alert.alert('Cart is Empty', 'Please add items before placing order.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const selectedSlot =
        MORNING_DELIVERY_SLOTS.find(s => s.id === selectedSlotId) || MORNING_DELIVERY_SLOTS[0];

      // Prepare complete Order Record
      const orderPayload = {
        userId: user.uid,
        customerName: user.name,
        customerPhone: user.phone,
        customerTier: user.tierStatus,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          unit: item.product.unit,
          imageUrl: item.product.imageUrl,
        })),
        subtotal: calculation.subtotal,
        discountPercentage: calculation.discountPercentage,
        discountAmount: calculation.discountAmount,
        deliveryFee: calculation.deliveryFee,
        totalAmount: calculation.totalAmount,
        paymentMethod: 'COD' as const, // Strictly Cash on Delivery
        status: 'CONFIRMED' as const,
        deliveryDate: liveCutoff.nextDeliveryIsoDate,
        deliverySlot: `${selectedSlot.title} (${selectedSlot.timeRange})`,
        deliveryAddress: activeAddress,
        placedAt: new Date().toISOString(),
      };

      // 4. Save to Firebase RTDB with Zero-Stock Guard and tier advancement
      const orderId = await placeOrder(orderPayload);

      // 5. Dual Sync to Relational SQL Database
      syncOrderToSqlDatabase({ ...orderPayload, id: orderId }, user).catch(
        syncErr => console.warn('Background SQL sync note:', syncErr.message)
      );

      // 6. Clear Cart & Celebrate
      onClearCart();
      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Order #${orderId.slice(-6)} confirmed.\n\nNext-Day Morning Delivery:\n📅 ${liveCutoff.nextDeliveryDateStr}\n⏰ ${selectedSlot.timeRange}\n💵 Payment: ₹${calculation.totalAmount} via Cash on Delivery (COD)`,
        [{ text: 'View Orders', onPress: () => onOrderSuccess(orderId) }]
      );
    } catch (err: any) {
      Alert.alert('Order Placement Error', err.message || 'Unable to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartEmoji}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSub}>
            Explore our fresh organic harvest and leafy vegetables straight from the farm!
          </Text>
          <Pressable style={styles.startShoppingBtn} onPress={onBackToShop}>
            <Text style={styles.startShoppingText}>Start Shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.sectionIcon}>📍</Text>
              <Text style={styles.cardTitle}>Delivery Address</Text>
            </View>
            <Pressable onPress={onOpenAddresses}>
              <Text style={styles.changeLink}>Change</Text>
            </Pressable>
          </View>
          {activeAddress ? (
            <View style={styles.addressBox}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{activeAddress.tag.toUpperCase()}</Text>
              </View>
              <Text style={styles.addressLine1}>{activeAddress.line1}</Text>
              {activeAddress.line2 ? (
                <Text style={styles.addressLine2}>{activeAddress.line2}</Text>
              ) : null}
              <Text style={styles.addressCity}>
                {activeAddress.city}, {activeAddress.state} – {activeAddress.pincode}
              </Text>
            </View>
          ) : (
            <Pressable style={styles.addAddressBox} onPress={onOpenAddresses}>
              <Text style={styles.addAddressPrompt}>+ Select or Add Delivery Address</Text>
            </Pressable>
          )}
        </View>

        {/* Next-Day Morning Delivery Slots (Strictly 8:00 AM – 11:59 AM) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.sectionIcon}>⚡</Text>
              <Text style={styles.cardTitle}>Next-Day Morning Delivery Slot</Text>
            </View>
            <Text style={styles.slotConstrainedTag}>8 AM – 11:59 AM</Text>
          </View>
          <Text style={styles.slotSubtitle}>
            Fresh dawn harvest delivered to your doorstep on {cutoff.nextDeliveryDateStr}:
          </Text>

          {MORNING_DELIVERY_SLOTS.map(slot => {
            const isSelected = selectedSlotId === slot.id;
            return (
              <Pressable
                key={slot.id}
                style={[
                  styles.slotOption,
                  isSelected && styles.slotOptionSelected,
                ]}
                onPress={() => setSelectedSlotId(slot.id)}
              >
                <View style={styles.slotRadio}>
                  <View style={[styles.slotRadioInner, isSelected && styles.slotRadioInnerSelected]} />
                </View>
                <View style={styles.slotInfo}>
                  <Text style={[styles.slotTitle, isSelected && styles.slotTitleSelected]}>
                    {slot.title}
                  </Text>
                  <Text style={styles.slotTime}>{slot.timeRange}</Text>
                </View>
                <View style={styles.assuredBadge}>
                  <Text style={styles.assuredBadgeText}>Assured</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Cart Items List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.sectionIcon}>🥕</Text>
              <Text style={styles.cardTitle}>Items in Cart ({cart.length})</Text>
            </View>
          </View>

          {cart.map(item => (
            <View style={styles.itemRow} key={item.product.id}>
              <Image
                source={{
                  uri: getProductImageUrl(item.product.imageUrl, item.product.category),
                }}
                style={styles.itemThumbnail}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemUnit}>
                  ₹{item.product.price} / {item.product.unit}
                </Text>
              </View>

              <View style={styles.itemStepper}>
                <Pressable
                  style={styles.itemStepperBtn}
                  onPress={() => onRemoveFromCart(item.product)}
                >
                  <Text style={styles.stepperText}>−</Text>
                </Pressable>
                <Text style={styles.itemQty}>{item.quantity}</Text>
                <Pressable
                  style={styles.itemStepperBtn}
                  onPress={() => onAddToCart(item.product)}
                >
                  <Text style={styles.stepperText}>+</Text>
                </Pressable>
              </View>

              <Text style={styles.itemTotal}>
                ₹{item.product.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Dynamic Loyalty Tier & Bill Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.sectionIcon}>🧾</Text>
              <Text style={styles.cardTitle}>Bill Summary</Text>
            </View>
            <View style={[styles.tierPill, { backgroundColor: tierInfo.badgeBg }]}>
              <Text style={[styles.tierPillText, { color: tierInfo.badgeTextColor }]}>
                {tierInfo.label}
              </Text>
            </View>
          </View>

          {/* Subtotal */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total (MRP)</Text>
            <Text style={styles.billValue}>₹{calculation.subtotal}</Text>
          </View>

          {/* Dynamic Tier Discount */}
          {calculation.discountAmount > 0 ? (
            <View style={styles.billRow}>
              <View style={styles.discountLabelRow}>
                <Text style={styles.billLabel}>Member Tier Discount</Text>
                <Text style={styles.discountBadge}>
                  {calculation.discountPercentage}% OFF
                </Text>
              </View>
              <Text style={styles.discountValue}>-₹{calculation.discountAmount}</Text>
            </View>
          ) : (
            <View style={styles.billRow}>
              <Text style={styles.billLabelMuted}>
                Member Discount (Order {tierInfo.nextTierGoal?.ordersNeeded || 1} more for Silver)
              </Text>
              <Text style={styles.billLabelMuted}>₹0</Text>
            </View>
          )}

          {/* Delivery Fee */}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Morning Farm Dispatch Fee</Text>
            <Text style={calculation.deliveryFee === 0 ? styles.freeDelivery : styles.billValue}>
              {calculation.deliveryFee === 0 ? 'FREE' : `₹${calculation.deliveryFee}`}
            </Text>
          </View>

          {calculation.subtotal < 199 && (
            <Text style={styles.freeDeliveryTip}>
              Add ₹{199 - calculation.subtotal} more to unlock FREE Delivery!
            </Text>
          )}

          <View style={styles.billDivider} />

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <View>
              <Text style={styles.grandTotalLabel}>To Pay</Text>
              <Text style={styles.codBadge}>Strictly Cash on Delivery (COD)</Text>
            </View>
            <Text style={styles.grandTotalValue}>₹{calculation.totalAmount}</Text>
          </View>
        </View>

        {/* 10:00 PM Cutoff Warning Banner if Closed */}
        {!cutoff.isOpen && (
          <View style={styles.cutoffAlertBox}>
            <Text style={styles.cutoffAlertTitle}>⚠️ Ordering Currently Closed</Text>
            <Text style={styles.cutoffAlertSub}>{cutoff.message}</Text>
          </View>
        )}

        {/* Checkout Button */}
        <Pressable
          style={[
            styles.placeOrderBtn,
            (!cutoff.isOpen || isPlacingOrder) && styles.placeOrderBtnDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={!cutoff.isOpen || isPlacingOrder}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View>
                <Text style={styles.btnPayText}>₹{calculation.totalAmount}</Text>
                <Text style={styles.btnPaySub}>CASH ON DELIVERY</Text>
              </View>
              <View style={styles.btnActionRow}>
                <Text style={styles.btnActionText}>
                  {cutoff.isOpen ? 'Place Morning Delivery Order' : 'Orders Closed After 10 PM'}
                </Text>
                {cutoff.isOpen && <Text style={styles.btnArrow}>›</Text>}
              </View>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCartEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  emptyCartSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  startShoppingBtn: {
    backgroundColor: '#0C831F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  startShoppingText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  changeLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
  },
  slotConstrainedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0C831F',
    backgroundColor: '#E8F7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slotSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  addressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagBadge: {
    backgroundColor: '#E8F7EC',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0C831F',
  },
  addressLine1: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  addressLine2: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 1,
  },
  addressCity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addAddressBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  addAddressPrompt: {
    color: '#0C831F',
    fontWeight: '700',
    fontSize: 13,
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  slotOptionSelected: {
    borderColor: '#0C831F',
    backgroundColor: '#F0FDF4',
  },
  slotRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  slotRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  slotRadioInnerSelected: {
    backgroundColor: '#0C831F',
  },
  slotInfo: {
    flex: 1,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  slotTitleSelected: {
    color: '#0C831F',
    fontWeight: '800',
  },
  slotTime: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  assuredBadge: {
    backgroundColor: '#E8F7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assuredBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0C831F',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  itemUnit: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  itemStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F7EC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0C831F',
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 10,
  },
  itemStepperBtn: {
    paddingHorizontal: 6,
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0C831F',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
    paddingHorizontal: 4,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    minWidth: 45,
    textAlign: 'right',
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  billLabelMuted: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0C831F',
    backgroundColor: '#E8F7EC',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  discountValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0C831F',
  },
  freeDelivery: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
  },
  freeDeliveryTip: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
    marginBottom: 6,
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  codBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0C831F',
    marginTop: 2,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  cutoffAlertBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cutoffAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  cutoffAlertSub: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  placeOrderBtn: {
    backgroundColor: '#0C831F',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  placeOrderBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  btnPaySub: {
    color: '#DCFCE7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  btnArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 6,
  },
});
