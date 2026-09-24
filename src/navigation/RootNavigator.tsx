import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CartItem, Product } from '../types';
import { subscribeToUserProfile, DEFAULT_USER } from '../services/firebaseRtdb';
import { PhoneOtpAuthScreen, AUTH_STORAGE_KEY } from '../screens/auth/PhoneOtpAuthScreen';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { CartScreen } from '../screens/customer/CartScreen';
import { AddressScreen } from '../screens/customer/AddressScreen';
import { WhatsAppOrder } from '../screens/customer/WhatsAppOrder';
import { OrdersScreen } from '../screens/customer/OrdersScreen';
import { InventoryManager } from '../screens/owner/InventoryManager';
import { OrderFeed } from '../screens/owner/OrderFeed';

type CustomerScreenTab = 'home' | 'cart' | 'addresses' | 'whatsapp' | 'orders';
type OwnerScreenTab = 'orders' | 'inventory';

export const RootNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'customer' | 'owner'>('customer');
  const [isOwnerPreviewingStore, setIsOwnerPreviewingStore] = useState(false);

  const [customerTab, setCustomerTab] = useState<CustomerScreenTab>('home');
  const [ownerTab, setOwnerTab] = useState<OwnerScreenTab>('orders');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Check saved session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed: UserProfile = JSON.parse(saved);
          setCurrentUser(parsed);
          setActiveRole(parsed.role || 'customer');
        }
      } catch (err) {
        console.warn('Error reading auth session:', err);
      } finally {
        setIsLoadingSession(false);
      }
    };
    restoreSession();
  }, []);

  // Listen to profile updates when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToUserProfile(currentUser.uid, profile => {
      setCurrentUser(profile);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    setIsOwnerPreviewingStore(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    setCurrentUser(null);
    setCart([]);
    setIsOwnerPreviewingStore(false);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx >= 0) {
        if (prev[idx].quantity > 1) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
          return next;
        }
        return prev.filter(item => item.product.id !== product.id);
      }
      return prev;
    });
  };

  const handleClearCart = () => setCart([]);

  if (isLoadingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0C831F" />
      </View>
    );
  }

  // 1. If not authenticated, require Phone Number & OTP verification first!
  if (!currentUser) {
    return <PhoneOtpAuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const effectiveUser = currentUser || DEFAULT_USER;
  const isOwner = activeRole === 'owner';
  const showCustomerView = !isOwner || isOwnerPreviewingStore;
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Owner Preview Mode Notification Bar */}
      {isOwner && isOwnerPreviewingStore && (
        <View style={[styles.previewModeBanner, { paddingTop: Math.max(insets.top, 8) }]}>
          <Text style={styles.previewModeText}>
            👁️ Previewing Customer Shop as Farm Owner
          </Text>
          <Pressable
            style={styles.returnOwnerBtn}
            onPress={() => setIsOwnerPreviewingStore(false)}
          >
            <Text style={styles.returnOwnerBtnText}>Return to Owner Desk</Text>
          </Pressable>
        </View>
      )}

      {/* Main Screens Container */}
      <View style={styles.body}>
        {showCustomerView ? (
          <>
            {customerTab === 'home' && (
              <HomeScreen
                cart={cart}
                user={effectiveUser}
                currentRole={isOwner ? 'owner' : 'customer'}
                onToggleRole={
                  isOwner
                    ? () => setIsOwnerPreviewingStore(!isOwnerPreviewingStore)
                    : () => {}
                }
                onLogout={handleLogout}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onOpenCart={() => setCustomerTab('cart')}
                onOpenAddresses={() => setCustomerTab('addresses')}
                onOpenWhatsApp={() => setCustomerTab('whatsapp')}
              />
            )}
            {customerTab === 'cart' && (
              <CartScreen
                cart={cart}
                user={effectiveUser}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onBackToShop={() => setCustomerTab('home')}
                onOpenAddresses={() => setCustomerTab('addresses')}
                onOrderSuccess={() => setCustomerTab('orders')}
              />
            )}
            {customerTab === 'addresses' && (
              <AddressScreen
                user={effectiveUser}
                onBack={() => setCustomerTab('home')}
              />
            )}
            {customerTab === 'whatsapp' && (
              <WhatsAppOrder
                cart={cart}
                user={effectiveUser}
                onBack={() => setCustomerTab('home')}
                onGoToShop={() => setCustomerTab('home')}
              />
            )}
            {customerTab === 'orders' && (
              <OrdersScreen
                user={effectiveUser}
                onBack={() => setCustomerTab('home')}
                onGoToShop={() => setCustomerTab('home')}
              />
            )}
          </>
        ) : (
          <>
            {ownerTab === 'orders' && (
              <OrderFeed
                onBackToCustomerView={() => setIsOwnerPreviewingStore(true)}
                onLogout={handleLogout}
              />
            )}
            {ownerTab === 'inventory' && (
              <InventoryManager
                onBackToCustomerView={() => setIsOwnerPreviewingStore(true)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </View>

      {/* Modern Quick-Commerce Bottom Tab Bar with Inset Padding */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            height: 58 + Math.max(insets.bottom, 12),
          },
        ]}
      >
        {showCustomerView ? (
          <>
            <Pressable
              style={styles.tabItem}
              onPress={() => setCustomerTab('home')}
            >
              <Text style={styles.tabIcon}>🛒</Text>
              <Text
                style={[
                  styles.tabLabel,
                  customerTab === 'home' && styles.tabLabelActive,
                ]}
              >
                Shop
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setCustomerTab('cart')}
            >
              <View style={styles.cartIconContainer}>
                <Text style={styles.tabIcon}>🛍️</Text>
                {cartTotalItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartTotalItems}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  customerTab === 'cart' && styles.tabLabelActive,
                ]}
              >
                Cart
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setCustomerTab('whatsapp')}
            >
              <Text style={styles.tabIcon}>💬</Text>
              <Text
                style={[
                  styles.tabLabel,
                  customerTab === 'whatsapp' && styles.tabLabelActive,
                ]}
              >
                WhatsApp
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setCustomerTab('orders')}
            >
              <Text style={styles.tabIcon}>📦</Text>
              <Text
                style={[
                  styles.tabLabel,
                  customerTab === 'orders' && styles.tabLabelActive,
                ]}
              >
                Orders
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setCustomerTab('addresses')}
            >
              <Text style={styles.tabIcon}>📍</Text>
              <Text
                style={[
                  styles.tabLabel,
                  customerTab === 'addresses' && styles.tabLabelActive,
                ]}
              >
                Address
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={styles.tabItem}
              onPress={() => setOwnerTab('orders')}
            >
              <Text style={styles.tabIcon}>📋</Text>
              <Text
                style={[
                  styles.tabLabel,
                  ownerTab === 'orders' && styles.tabLabelActive,
                ]}
              >
                Incoming COD Orders
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setOwnerTab('inventory')}
            >
              <Text style={styles.tabIcon}>🌾</Text>
              <Text
                style={[
                  styles.tabLabel,
                  ownerTab === 'inventory' && styles.tabLabelActive,
                ]}
              >
                Inventory & Stock
              </Text>
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setIsOwnerPreviewingStore(true)}
            >
              <Text style={styles.tabIcon}>👁️</Text>
              <Text style={styles.tabLabel}>Customer Shop View</Text>
            </Pressable>

            <Pressable style={styles.tabItem} onPress={handleLogout}>
              <Text style={styles.tabIcon}>🚪</Text>
              <Text style={styles.tabLabel}>Sign Out</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewModeBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  previewModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },
  returnOwnerBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  returnOwnerBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 12,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#0C831F',
    fontWeight: '900',
  },
  cartIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: '#0C831F',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
