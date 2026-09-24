import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text, SafeAreaView } from 'react-native';
import { UserProfile, CartItem, Product } from '../types';
import { subscribeToUserProfile, DEFAULT_USER } from '../services/firebaseRtdb';
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
  const [role, setRole] = useState<'customer' | 'owner'>('customer');
  const [customerTab, setCustomerTab] = useState<CustomerScreenTab>('home');
  const [ownerTab, setOwnerTab] = useState<OwnerScreenTab>('orders');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    const unsub = subscribeToUserProfile(DEFAULT_USER.uid, profile => {
      setUser(profile);
    });
    return () => unsub();
  }, []);

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

  const toggleRole = () => {
    setRole(r => (r === 'customer' ? 'owner' : 'customer'));
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {role === 'customer' ? (
          <>
            {customerTab === 'home' && (
              <HomeScreen
                cart={cart}
                user={user}
                currentRole={role}
                onToggleRole={toggleRole}
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
                user={user}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onBackToShop={() => setCustomerTab('home')}
                onOpenAddresses={() => setCustomerTab('addresses')}
                onOrderSuccess={orderId => setCustomerTab('orders')}
              />
            )}
            {customerTab === 'addresses' && (
              <AddressScreen
                user={user}
                onBack={() => setCustomerTab('home')}
              />
            )}
            {customerTab === 'whatsapp' && (
              <WhatsAppOrder
                cart={cart}
                user={user}
                onBack={() => setCustomerTab('home')}
                onGoToShop={() => setCustomerTab('home')}
              />
            )}
            {customerTab === 'orders' && (
              <OrdersScreen
                user={user}
                onBack={() => setCustomerTab('home')}
                onGoToShop={() => setCustomerTab('home')}
              />
            )}
          </>
        ) : (
          <>
            {ownerTab === 'orders' && (
              <OrderFeed onBackToCustomerView={() => setRole('customer')} />
            )}
            {ownerTab === 'inventory' && (
              <InventoryManager onBackToCustomerView={() => setRole('customer')} />
            )}
          </>
        )}
      </View>

      {/* Modern Quick-Commerce Bottom Tab Bar */}
      <View style={styles.bottomBar}>
        {role === 'customer' ? (
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

            <Pressable style={styles.tabItem} onPress={() => setRole('customer')}>
              <Text style={styles.tabIcon}>🔄</Text>
              <Text style={styles.tabLabel}>Shop View</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 2,
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
