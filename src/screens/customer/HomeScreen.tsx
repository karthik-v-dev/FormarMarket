import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Product, ProductCategory, CartItem, UserProfile } from '../../types';
import { subscribeToProducts, subscribeToUserProfile } from '../../services/firebaseRtdb';
import { ZeptoHeader } from '../../components/common/ZeptoHeader';
import { ProductCard } from '../../components/common/ProductCard';
import { CartFloatingBar } from '../../components/common/CartFloatingBar';
import { DeliveryCutoffBanner } from '../../components/common/DeliveryCutoffBanner';

interface HomeScreenProps {
  cart: CartItem[];
  user: UserProfile;
  currentRole: 'customer' | 'owner';
  onToggleRole: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onOpenCart: () => void;
  onOpenAddresses: () => void;
  onOpenWhatsApp: () => void;
}

interface CategoryFilter {
  id: 'all' | ProductCategory;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryFilter[] = [
  { id: 'all', label: 'All Items', icon: '🛒' },
  { id: 'leafy_greens', label: 'Leafy Greens', icon: '🥬' },
  { id: 'veggies', label: 'Fresh Veggies', icon: '🥕' },
  { id: 'rice_bags', label: 'Rice Bags', icon: '🍚' },
  { id: 'organic_specials', label: 'Organic Specials', icon: '🍯' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  cart,
  user,
  currentRole,
  onToggleRole,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  onOpenAddresses,
  onOpenWhatsApp,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProducts(list => {
      setProducts(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartQuantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach(item => {
      map[item.product.id] = item.quantity;
    });
    return map;
  }, [cart]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Zepto Top Header */}
      <ZeptoHeader
        user={user}
        currentRole={currentRole}
        onToggleRole={onToggleRole}
        onAddressPress={onOpenAddresses}
      />

      {/* 10 PM IST Cutoff & Morning Delivery Window Banner */}
      <DeliveryCutoffBanner />

      {/* Search Bar & WhatsApp Action Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search spinach, organic rice, fresh veggies..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearch}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* WhatsApp Quick Order Floating Trigger Button */}
        <Pressable style={styles.whatsAppButton} onPress={onOpenWhatsApp}>
          <Text style={styles.whatsAppIcon}>💬</Text>
          <Text style={styles.whatsAppText}>WA Order</Text>
        </Pressable>
      </View>

      {/* Category Pills Bar */}
      <View style={styles.categoryBarContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.categoryListContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <Pressable
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0C831F" />
          <Text style={styles.loadingText}>Fetching farm fresh harvest...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0C831F']}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              quantityInCart={cartQuantityMap[item.id] || 0}
              userTier={user.tierStatus}
              onAdd={onAddToCart}
              onRemove={onRemoveFromCart}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🥬</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search or category filter.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Bottom Cart Bar */}
      <CartFloatingBar
        cart={cart}
        userTier={user.tierStatus}
        onPress={onOpenCart}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 4,
  },
  whatsAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsAppIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  whatsAppText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  categoryBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryListContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: '#E8F7EC',
    borderWidth: 1,
    borderColor: '#0C831F',
  },
  categoryIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  categoryLabelActive: {
    color: '#0C831F',
    fontWeight: '800',
  },
  productListContent: {
    paddingHorizontal: 11,
    paddingTop: 8,
    paddingBottom: 90, // space for floating bar
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
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
  },
});
