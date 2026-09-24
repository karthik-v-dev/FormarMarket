import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Product, CustomerTier } from '../../types';
import { getProductImageUrl } from '../../utils/unsplashImages';
import { getTierInfo } from '../../utils/tierCalculator';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  userTier: CustomerTier;
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  userTier,
  onAdd,
  onRemove,
}) => {
  const [imageError, setImageError] = useState(false);
  const tierInfo = getTierInfo(userTier);

  // Price calculations with loyalty tier discount
  const originalPrice = product.price;
  const hasDiscount = tierInfo.discountPercentage > 0;
  const discountedPrice = Math.round(originalPrice * (1 - tierInfo.discountPercentage / 100));

  const isOutOfStock = product.stockQuantity <= 0 || product.isDisabled;
  const imageUrl = imageError
    ? getProductImageUrl(null, product.category)
    : getProductImageUrl(product.imageUrl, product.category);

  return (
    <View style={[styles.card, isOutOfStock && styles.outOfStockCard]}>
      {/* Product Image & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.productImage, isOutOfStock && styles.outOfStockImage]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        {/* Harvest Freshness Tag */}
        <View style={styles.freshTag}>
          <Text style={styles.freshTagText}>🌱 Farm Direct</Text>
        </View>

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockOverlayText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.unitRow}>
          <Text style={styles.unitText}>{product.unit.toUpperCase()}</Text>
          {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <Text style={styles.lowStockText}>Only {product.stockQuantity} left</Text>
          )}
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View>
            <View style={styles.priceContainer}>
              <Text style={styles.finalPrice}>₹{discountedPrice}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              )}
            </View>
            {hasDiscount && (
              <Text style={styles.tierSavingsTag}>
                {tierInfo.discountPercentage}% tier savings
              </Text>
            )}
          </View>

          {/* Stepper Controls */}
          {isOutOfStock ? (
            <View style={styles.disabledBtn}>
              <Text style={styles.disabledBtnText}>Unavailable</Text>
            </View>
          ) : quantityInCart > 0 ? (
            <View style={styles.stepperContainer}>
              <Pressable
                style={styles.stepperActionBtn}
                onPress={() => onRemove(product)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.stepperMinus}>−</Text>
              </Pressable>
              <Text style={styles.stepperQuantity}>{quantityInCart}</Text>
              <Pressable
                style={styles.stepperActionBtn}
                onPress={() => onAdd(product)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.stepperPlus}>+</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.addBtn}
              onPress={() => onAdd(product)}
            >
              <Text style={styles.addBtnText}>ADD</Text>
              <Text style={styles.addBtnPlus}>+</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginBottom: 12,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  outOfStockCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockImage: {
    opacity: 0.45,
  },
  freshTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freshTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0C831F',
  },
  stockOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  detailsContainer: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  lowStockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  finalPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  tierSavingsTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0C831F',
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F7EC',
    borderWidth: 1.2,
    borderColor: '#0C831F',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0C831F',
  },
  addBtnPlus: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0C831F',
    marginLeft: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C831F',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepperActionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperMinus: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepperQuantity: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingHorizontal: 6,
  },
  stepperPlus: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  disabledBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  disabledBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
});
