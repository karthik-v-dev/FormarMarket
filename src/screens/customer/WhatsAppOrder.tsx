import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItem, UserProfile } from '../../types';
import { calculateCartSummary, getTierInfo } from '../../utils/tierCalculator';
import { checkOrderCutoff, MORNING_DELIVERY_SLOTS } from '../../utils/timeCutoff';

interface WhatsAppOrderProps {
  cart: CartItem[];
  user: UserProfile;
  onBack: () => void;
  onGoToShop: () => void;
}

export const WhatsAppOrder: React.FC<WhatsAppOrderProps> = ({
  cart,
  user,
  onBack,
  onGoToShop,
}) => {
  // Check if user is an existing repeat customer (previousOrderCount > 0)
  const isExistingCustomer = (user.totalOrdersCount || 0) > 0 || (user.monthlyOrderCount || 0) > 0;

  const activeAddress =
    user.addresses[user.activeAddressId] || Object.values(user.addresses || {})[0];

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const calculation = calculateCartSummary(rawSubtotal, user.tierStatus);
  const tierInfo = getTierInfo(user.tierStatus, user.monthlyOrderCount);
  const cutoff = checkOrderCutoff();

  const handleLaunchWhatsApp = async () => {
    if (!isExistingCustomer) {
      Alert.alert(
        '🔒 Repeat Member Feature',
        'WhatsApp Quick Ordering is exclusive to our repeat members who have placed at least 1 completed order on the app. Please place your first order directly in the app to activate WhatsApp ordering!',
        [{ text: 'Place First Order', onPress: onGoToShop }]
      );
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Cart is Empty', 'Please add items to your cart before generating a WhatsApp order.');
      return;
    }

    if (!activeAddress) {
      Alert.alert('Missing Address', 'Please select a delivery address in the app first.');
      return;
    }

    // Build formatted message
    const lines = [
      `🛒 *NEW ORGANIC GROCERY ORDER via APP*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Customer:* ${user.name} (${user.phone})`,
      `🏷️ *Member Tier:* ${tierInfo.label} (${tierInfo.discountPercentage}% OFF)`,
      ``,
      `📦 *ITEMS ORDERED:*`,
    ];

    cart.forEach((item, index) => {
      lines.push(
        `${index + 1}. *${item.product.name}*`
      );
      lines.push(
        `   Qty: ${item.quantity} × ${item.product.unit} @ ₹${item.product.price} = ₹${item.product.price * item.quantity}`
      );
    });

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💰 *Item Total (MRP):* ₹${calculation.subtotal}`);
    if (calculation.discountAmount > 0) {
      lines.push(`🎉 *Tier Savings (${calculation.discountPercentage}%):* -₹${calculation.discountAmount}`);
    }
    lines.push(`🚚 *Morning Delivery Fee:* ${calculation.deliveryFee === 0 ? 'FREE' : `₹${calculation.deliveryFee}`}`);
    lines.push(`💵 *Grand Total (COD):* *₹${calculation.totalAmount}*`);
    lines.push(``);
    lines.push(`📅 *Delivery Date:* ${cutoff.nextDeliveryDateStr}`);
    lines.push(`⏰ *Delivery Slot:* ${MORNING_DELIVERY_SLOTS[0].title} (8:00 AM – 9:30 AM)`);
    lines.push(`📍 *Delivery Address:*`);
    lines.push(`   ${activeAddress.line1}`);
    if (activeAddress.line2) lines.push(`   ${activeAddress.line2}`);
    lines.push(`   ${activeAddress.city} – ${activeAddress.pincode}`);
    lines.push(``);
    lines.push(`Please confirm and dispatch tomorrow morning. Thank you! 🙏`);

    const fullMessage = lines.join('\n');
    const storeWhatsAppNumber = '919876543210';
    const waUrl = `https://wa.me/${storeWhatsAppNumber}?text=${encodeURIComponent(fullMessage)}`;

    try {
      const supported = await Linking.canOpenURL(waUrl);
      if (supported) {
        await Linking.openURL(waUrl);
      } else {
        // Fallback open
        await Linking.openURL(waUrl);
      }
    } catch (err: any) {
      Alert.alert('Cannot Open WhatsApp', 'Please ensure WhatsApp is installed on your device.');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Order via WhatsApp</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 40 + Math.max(insets.bottom, 12) },
        ]}
      >
        {/* Eligibility Verification Card */}
        {isExistingCustomer ? (
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedIconCircle}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
            <View style={styles.verifiedTextContainer}>
              <Text style={styles.verifiedTitle}>Repeat Member Verified</Text>
              <Text style={styles.verifiedSub}>
                {user.totalOrdersCount} completed orders. Instant 1-tap WhatsApp VIP ordering unlocked!
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.lockedCard}>
            <View style={styles.lockedIconCircle}>
              <Text style={styles.lockedIcon}>🔒</Text>
            </View>
            <View style={styles.lockedTextContainer}>
              <Text style={styles.lockedTitle}>Existing Members Privilege</Text>
              <Text style={styles.lockedSub}>
                Direct WhatsApp ordering unlocks automatically after your 1st completed order on the app.
              </Text>
            </View>
          </View>
        )}

        {/* How it works info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚡ HOW WHATSAPP ORDERING WORKS</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepDesc}>Add farm fresh vegetables to your cart.</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepDesc}>Tap "Send WhatsApp Order" below.</Text>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepDesc}>
              A pre-formatted message with items, address, and COD total opens in WhatsApp for immediate farm manager dispatch.
            </Text>
          </View>
        </View>

        {/* Live Cart Preview */}
        <View style={styles.cartPreviewCard}>
          <Text style={styles.previewTitle}>CURRENT CART SUMMARY</Text>
          <Text style={styles.previewItemsCount}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} in cart • Total:{' '}
            <Text style={styles.previewPrice}>₹{calculation.totalAmount}</Text> (COD)
          </Text>
          {calculation.discountAmount > 0 && (
            <Text style={styles.previewDiscount}>
              Includes {calculation.discountPercentage}% {tierInfo.label} discount (-₹{calculation.discountAmount})
            </Text>
          )}

          {cart.length === 0 && (
            <Text style={styles.emptyCartNote}>
              Your cart is currently empty. Add products from the shop to order via WhatsApp.
            </Text>
          )}
        </View>

        {/* WhatsApp Launch Button */}
        <Pressable
          style={[
            styles.whatsAppLaunchBtn,
            (!isExistingCustomer || cart.length === 0) && styles.whatsAppLaunchBtnDisabled,
          ]}
          onPress={handleLaunchWhatsApp}
        >
          <Text style={styles.waBtnIcon}>💬</Text>
          <Text style={styles.waBtnText}>
            {isExistingCustomer
              ? cart.length > 0
                ? 'Send Order to WhatsApp Farm Desk'
                : 'Add Items to Order via WhatsApp'
              : 'Complete 1st Order to Unlock'}
          </Text>
        </Pressable>

        {!isExistingCustomer && (
          <Pressable style={styles.shopNowBtn} onPress={onGoToShop}>
            <Text style={styles.shopNowText}>Shop Now to Unlock Feature</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  content: {
    padding: 16,
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  verifiedIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  verifiedIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  verifiedTextContainer: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
  verifiedSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  lockedIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lockedIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  lockedTextContainer: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  lockedSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F7EC',
    color: '#0C831F',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
    marginRight: 10,
  },
  stepDesc: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
    fontWeight: '600',
  },
  cartPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  previewItemsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0C831F',
  },
  previewDiscount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0C831F',
    marginTop: 4,
  },
  emptyCartNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  whatsAppLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  whatsAppLaunchBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  waBtnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  shopNowBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shopNowText: {
    color: '#0C831F',
    fontWeight: '800',
    fontSize: 13,
  },
});
