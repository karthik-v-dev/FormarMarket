import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartItem, CustomerTier } from '../../types';
import { calculateCartSummary } from '../../utils/tierCalculator';

interface CartFloatingBarProps {
  cart: CartItem[];
  userTier: CustomerTier;
  onPress: () => void;
}

export const CartFloatingBar: React.FC<CartFloatingBarProps> = ({
  cart,
  userTier,
  onPress,
}) => {
  const insets = useSafeAreaInsets();
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItemCount === 0) return null;

  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const calculation = calculateCartSummary(rawSubtotal, userTier);

  // Position above the tab bar and the Android soft navigation bar
  const bottomPosition = Math.max(insets.bottom, 12) + 68;

  return (
    <View style={[styles.floatingContainer, { bottom: bottomPosition }]}>
      <Pressable style={styles.bar} onPress={onPress}>
        <View style={styles.leftSection}>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{totalItemCount}</Text>
          </View>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.totalPrice}>₹{calculation.totalAmount}</Text>
              {calculation.discountAmount > 0 && (
                <Text style={styles.mrpCrossed}>₹{calculation.subtotal}</Text>
              )}
            </View>
            <Text style={styles.savingsSubtext}>
              {calculation.discountAmount > 0
                ? `You save ₹${calculation.discountAmount} with Tier!`
                : 'Cash on Delivery (COD)'}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99,
  },
  bar: {
    backgroundColor: '#0C831F',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  itemCountText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalPrice: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  mrpCrossed: {
    color: '#A7F3D0',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontWeight: '600',
  },
  savingsSubtext: {
    color: '#DCFCE7',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 4,
    lineHeight: 18,
  },
});
