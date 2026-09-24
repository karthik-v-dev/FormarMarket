import { ref, onValue, set, update, push, get, DatabaseReference } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rtdb } from '../firebase';
import { Product, Order, UserProfile, Address, OrderStatus, CustomerTier } from '../types';
import { calculateTier } from '../utils/tierCalculator';
import { CATEGORY_FALLBACK_IMAGES } from '../utils/unsplashImages';

const STORAGE_PRODUCTS_KEY = '@zepto_cached_products_v1';
const STORAGE_ORDERS_KEY = '@zepto_cached_orders_v1';
const STORAGE_USER_KEY = '@zepto_cached_user_v1';

export const SEED_PRODUCTS: Product[] = [
  // Leafy Greens
  {
    id: 'prod_leafy_1',
    name: 'Fresh Palak (Spinach Bunch)',
    category: 'leafy_greens',
    price: 35,
    unit: 'bunch',
    stockQuantity: 45,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp, organically grown pesticide-free farm spinach bunches.',
  },
  {
    id: 'prod_leafy_2',
    name: 'Fresh Coriander (Kothmir)',
    category: 'leafy_greens',
    price: 20,
    unit: 'bunch',
    stockQuantity: 60,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
    description: 'Aromatic green coriander harvested at dawn.',
  },
  {
    id: 'prod_leafy_3',
    name: 'Fresh Mint (Pudina Bunch)',
    category: 'leafy_greens',
    price: 18,
    unit: 'bunch',
    stockQuantity: 30,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80',
    description: 'Fragrant garden mint for chutneys, tea, and garnishing.',
  },
  {
    id: 'prod_leafy_4',
    name: 'Organic Methi (Fenugreek)',
    category: 'leafy_greens',
    price: 28,
    unit: 'bunch',
    stockQuantity: 25,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Tender micro-leaf fenugreek rich in iron and minerals.',
  },

  // Fresh Veggies
  {
    id: 'prod_veg_1',
    name: 'Country Tomatoes (Tamatar)',
    category: 'veggies',
    price: 42,
    unit: 'kg',
    stockQuantity: 80,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    description: 'Juicy, naturally ripened vine tomatoes bursting with flavor.',
  },
  {
    id: 'prod_veg_2',
    name: 'Nashik Red Onions (Pyaz)',
    category: 'veggies',
    price: 38,
    unit: 'kg',
    stockQuantity: 120,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    description: 'Premium cured red onions with crisp texture and long shelf life.',
  },
  {
    id: 'prod_veg_3',
    name: 'Baby Potatoes (Farm Aloo)',
    category: 'veggies',
    price: 32,
    unit: 'kg',
    stockQuantity: 95,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    description: 'Golden earthy new-harvest baby potatoes directly from soil.',
  },
  {
    id: 'prod_veg_4',
    name: 'Crisp Green Capsicum',
    category: 'veggies',
    price: 65,
    unit: '500g',
    stockQuantity: 35,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    description: 'Glossy, bell-shaped green peppers with thick crunchy walls.',
  },
  {
    id: 'prod_veg_5',
    name: 'Crunchy Orange Carrots',
    category: 'veggies',
    price: 48,
    unit: 'kg',
    stockQuantity: 50,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
    description: 'Sweet, freshly washed field carrots perfect for salads and cooking.',
  },

  // Organic Rice Bags
  {
    id: 'prod_rice_1',
    name: 'Royal Basmati Rice (5kg Bag)',
    category: 'rice_bags',
    price: 490,
    unit: 'bag',
    stockQuantity: 20,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Aged long-grain aromatic traditional basmati rice.',
  },
  {
    id: 'prod_rice_2',
    name: 'Sona Masoori Raw Rice (10kg)',
    category: 'rice_bags',
    price: 650,
    unit: 'bag',
    stockQuantity: 15,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
    description: 'Lightweight, easily digestible everyday raw rice grain.',
  },
  {
    id: 'prod_rice_3',
    name: 'Organic Brown Rice (5kg Bag)',
    category: 'rice_bags',
    price: 380,
    unit: 'bag',
    stockQuantity: 12,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    description: 'Unpolished whole grain brown rice with intact bran and fiber.',
  },

  // Pure Organic Specials
  {
    id: 'prod_organic_1',
    name: 'Wood-Pressed Coconut Oil (1L)',
    category: 'organic_specials',
    price: 320,
    unit: 'bottle',
    stockQuantity: 18,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    description: 'Traditional Mara Chekku cold-pressed unrefined coconut oil.',
  },
  {
    id: 'prod_organic_2',
    name: 'Wild Forest Raw Honey (500g)',
    category: 'organic_specials',
    price: 299,
    unit: 'bottle',
    stockQuantity: 22,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    description: 'Raw, unpasteurized multi-floral forest honey with natural pollen.',
  },
  {
    id: 'prod_organic_3',
    name: 'Lakadong High-Curcumin Turmeric',
    category: 'organic_specials',
    price: 160,
    unit: '500g',
    stockQuantity: 40,
    isDisabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    description: 'Meghalaya Lakadong turmeric powder with guaranteed >7% curcumin.',
  },
];

export const DEFAULT_USER: UserProfile = {
  uid: 'user_zepto_demo_101',
  phone: '+91 98765 43210',
  name: 'Karthik V',
  email: 'karthik@formersmarket.in',
  role: 'customer',
  tierStatus: 'silver',
  monthlyOrderCount: 3,
  totalOrdersCount: 5,
  activeAddressId: 'addr_home',
  addresses: {
    addr_home: {
      id: 'addr_home',
      tag: 'Home',
      line1: 'Flat 402, Green Meadows Tower',
      line2: '14th Cross, Green Valley Layout',
      landmark: 'Near Organic Park Gate',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      isCurrentForDelivery: true,
    },
    addr_work: {
      id: 'addr_work',
      tag: 'Work',
      line1: 'Tech Park Block B, Level 3',
      line2: 'Outer Ring Road',
      landmark: 'Opposite Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      isCurrentForDelivery: false,
    },
  },
};

// ----------------------------------------------------
// LOCAL CACHING & FALLBACK HELPERS
// ----------------------------------------------------

async function getLocalProducts(): Promise<Product[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load local products cache', err);
  }
  return SEED_PRODUCTS;
}

async function setLocalProducts(products: Product[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to save local products cache', err);
  }
}

async function getLocalOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load local orders cache', err);
  }
  return [];
}

async function setLocalOrders(orders: Order[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Failed to save local orders cache', err);
  }
}

async function getLocalUser(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load local user cache', err);
  }
  return DEFAULT_USER;
}

async function setLocalUser(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save local user cache', err);
  }
}

// ----------------------------------------------------
// REALTIME RTDB SERVICES WITH ZERO-STOCK GUARD
// ----------------------------------------------------

/**
 * Subscribe to Product Catalog in Realtime
 */
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  let isUnmounted = false;

  // Immediately serve cached / seeded data for instant Zepto-speed UX
  getLocalProducts().then(cached => {
    if (!isUnmounted) callback(cached);
  });

  try {
    const productsRef = ref(rtdb, 'products');
    const unsubscribe = onValue(
      productsRef,
      async snapshot => {
        if (isUnmounted) return;
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          let list: Product[] = [];
          if (Array.isArray(val)) {
            list = val.filter(Boolean);
          } else {
            list = Object.keys(val).map(key => ({
              ...val[key],
              id: key,
            }));
          }
          await setLocalProducts(list);
          callback(list);
        } else {
          // If empty in RTDB, seed default inventory
          await seedInitialProducts();
          const seeded = await getLocalProducts();
          callback(seeded);
        }
      },
      error => {
        console.warn('RTDB onValue products listener note:', error.message);
        // Fallback to local cache
        getLocalProducts().then(cached => callback(cached));
      }
    );

    return () => {
      isUnmounted = true;
      try {
        unsubscribe();
      } catch {}
    };
  } catch (err) {
    console.warn('RTDB subscribe error, relying on local sync', err);
    return () => {
      isUnmounted = true;
    };
  }
}

/**
 * Seed initial catalog if database is empty
 */
export async function seedInitialProducts(): Promise<void> {
  try {
    const productsRef = ref(rtdb, 'products');
    const payload: Record<string, Product> = {};
    SEED_PRODUCTS.forEach(p => {
      payload[p.id] = p;
    });
    await set(productsRef, payload);
    await setLocalProducts(SEED_PRODUCTS);
  } catch (err: any) {
    console.warn('Could not seed RTDB directly, keeping seeded in local cache:', err.message);
    await setLocalProducts(SEED_PRODUCTS);
  }
}

/**
 * Update Product with Automated Zero-Stock Guard:
 * If product quantity hits 0, automatically mark isDisabled = true and lock it on customer screens.
 */
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  // Automated Zero-Stock Guard rule
  const finalUpdates: Partial<Product> = { ...updates };
  if (typeof finalUpdates.stockQuantity === 'number') {
    if (finalUpdates.stockQuantity <= 0) {
      finalUpdates.stockQuantity = 0;
      finalUpdates.isDisabled = true; // Lock item automatically
    }
  }

  // Update in local cache first
  const current = await getLocalProducts();
  const index = current.findIndex(p => p.id === productId);
  if (index >= 0) {
    current[index] = { ...current[index], ...finalUpdates };
    await setLocalProducts(current);
  }

  // Sync to RTDB
  try {
    const productRef = ref(rtdb, `products/${productId}`);
    await update(productRef, finalUpdates);
  } catch (err: any) {
    console.warn('RTDB updateProduct error, saved locally:', err.message);
  }
}

/**
 * Add a new Product to Inventory
 */
export async function createProduct(newProd: Omit<Product, 'id'>): Promise<string> {
  const tempId = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const product: Product = {
    ...newProd,
    id: tempId,
    isDisabled: newProd.stockQuantity <= 0 ? true : newProd.isDisabled,
  };

  const current = await getLocalProducts();
  current.unshift(product);
  await setLocalProducts(current);

  try {
    const productsRef = ref(rtdb, 'products');
    const newRef = push(productsRef);
    const assignedId = newRef.key || tempId;
    product.id = assignedId;
    await set(newRef, product);
    return assignedId;
  } catch (err: any) {
    console.warn('RTDB createProduct error, saved locally:', err.message);
    return tempId;
  }
}

/**
 * Subscribe to User Profile in Realtime
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (user: UserProfile) => void
): () => void {
  let isUnmounted = false;

  getLocalUser().then(user => {
    if (!isUnmounted) callback(user);
  });

  try {
    const userRef = ref(rtdb, `users/${uid}`);
    const unsubscribe = onValue(
      userRef,
      async snapshot => {
        if (isUnmounted) return;
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          const userObj: UserProfile = {
            ...DEFAULT_USER,
            ...val,
            uid,
            tierStatus: calculateTier(val.monthlyOrderCount || 0),
          };
          await setLocalUser(userObj);
          callback(userObj);
        } else {
          // Initialize user in RTDB
          await set(userRef, DEFAULT_USER).catch(() => {});
        }
      },
      error => {
        console.warn('RTDB user listener note:', error.message);
      }
    );

    return () => {
      isUnmounted = true;
      try {
        unsubscribe();
      } catch {}
    };
  } catch (err) {
    return () => {
      isUnmounted = true;
    };
  }
}

/**
 * Save / Update User Address
 */
export async function saveUserAddress(uid: string, address: Address): Promise<void> {
  const user = await getLocalUser();
  const currentAddresses = { ...user.addresses };

  if (address.isCurrentForDelivery) {
    // Unmark all other addresses
    Object.keys(currentAddresses).forEach(k => {
      currentAddresses[k].isCurrentForDelivery = false;
    });
  }

  currentAddresses[address.id] = address;
  const updatedUser: UserProfile = {
    ...user,
    addresses: currentAddresses,
    activeAddressId: address.isCurrentForDelivery ? address.id : user.activeAddressId,
  };

  await setLocalUser(updatedUser);

  try {
    const userRef = ref(rtdb, `users/${uid}`);
    await update(userRef, {
      addresses: currentAddresses,
      activeAddressId: updatedUser.activeAddressId,
    });
  } catch (err: any) {
    console.warn('RTDB saveUserAddress error, saved locally:', err.message);
  }
}

/**
 * Set Primary Active Address for Delivery
 */
export async function setActiveAddress(uid: string, addressId: string): Promise<void> {
  const user = await getLocalUser();
  const currentAddresses = { ...user.addresses };

  Object.keys(currentAddresses).forEach(k => {
    currentAddresses[k].isCurrentForDelivery = k === addressId;
  });

  const updatedUser: UserProfile = {
    ...user,
    addresses: currentAddresses,
    activeAddressId: addressId,
  };

  await setLocalUser(updatedUser);

  try {
    const userRef = ref(rtdb, `users/${uid}`);
    await update(userRef, {
      addresses: currentAddresses,
      activeAddressId: addressId,
    });
  } catch (err: any) {
    console.warn('RTDB setActiveAddress error, saved locally:', err.message);
  }
}

/**
 * Subscribe to Orders Feed in Realtime (for Customer & Owner)
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  let isUnmounted = false;

  getLocalOrders().then(cached => {
    if (!isUnmounted) callback(cached);
  });

  try {
    const ordersRef = ref(rtdb, 'orders');
    const unsubscribe = onValue(
      ordersRef,
      async snapshot => {
        if (isUnmounted) return;
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          const list: Order[] = Object.keys(val).map(key => ({
            ...val[key],
            id: key,
          }));
          // Sort newest first
          list.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
          await setLocalOrders(list);
          callback(list);
        } else {
          const local = await getLocalOrders();
          callback(local);
        }
      },
      error => {
        console.warn('RTDB orders listener note:', error.message);
      }
    );

    return () => {
      isUnmounted = true;
      try {
        unsubscribe();
      } catch {}
    };
  } catch (err) {
    return () => {
      isUnmounted = true;
    };
  }
}

/**
 * Place a new COD Order with automatic inventory decrement and Zero-Stock Guard
 */
export async function placeOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  const orderId = `ORD_${Date.now().toString().slice(-6)}_${Math.floor(Math.random() * 900 + 100)}`;
  const order: Order = {
    ...orderData,
    id: orderId,
  };

  // 1. Save in local orders list
  const currentOrders = await getLocalOrders();
  currentOrders.unshift(order);
  await setLocalOrders(currentOrders);

  // 2. Decrement inventory with Zero-Stock Guard
  const currentProducts = await getLocalProducts();
  for (const item of order.items) {
    const prodIndex = currentProducts.findIndex(p => p.id === item.productId);
    if (prodIndex >= 0) {
      const remaining = currentProducts[prodIndex].stockQuantity - item.quantity;
      currentProducts[prodIndex].stockQuantity = Math.max(0, remaining);
      if (currentProducts[prodIndex].stockQuantity === 0) {
        currentProducts[prodIndex].isDisabled = true; // Lock item!
      }
      // Update in RTDB
      updateProduct(item.productId, {
        stockQuantity: currentProducts[prodIndex].stockQuantity,
        isDisabled: currentProducts[prodIndex].isDisabled,
      }).catch(() => {});
    }
  }
  await setLocalProducts(currentProducts);

  // 3. Increment User's monthlyOrderCount & recalculate tier!
  const user = await getLocalUser();
  const nextMonthlyCount = (user.monthlyOrderCount || 0) + 1;
  const nextTotalCount = (user.totalOrdersCount || 0) + 1;
  const nextTier = calculateTier(nextMonthlyCount);

  const updatedUser: UserProfile = {
    ...user,
    monthlyOrderCount: nextMonthlyCount,
    totalOrdersCount: nextTotalCount,
    tierStatus: nextTier,
  };
  await setLocalUser(updatedUser);

  try {
    const userRef = ref(rtdb, `users/${user.uid}`);
    await update(userRef, {
      monthlyOrderCount: nextMonthlyCount,
      totalOrdersCount: nextTotalCount,
      tierStatus: nextTier,
    });
  } catch (err: any) {
    console.warn('RTDB updateUser order count note:', err.message);
  }

  // 4. Save Order in RTDB
  try {
    const orderRef = ref(rtdb, `orders/${orderId}`);
    await set(orderRef, order);
  } catch (err: any) {
    console.warn('RTDB placeOrder error, stored locally:', err.message);
  }

  return orderId;
}

/**
 * Update Order Status (Pending -> Confirmed -> Dispatched -> Delivered)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const currentOrders = await getLocalOrders();
  const index = currentOrders.findIndex(o => o.id === orderId);
  if (index >= 0) {
    currentOrders[index].status = status;
    await setLocalOrders(currentOrders);
  }

  try {
    const orderRef = ref(rtdb, `orders/${orderId}`);
    await update(orderRef, { status });
  } catch (err: any) {
    console.warn('RTDB updateOrderStatus error, updated locally:', err.message);
  }
}
