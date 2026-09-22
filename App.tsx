import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.241:4000/api/v1";
const TOKEN_KEY = "fresh_veggies_token";
const CART_KEY = "fresh_veggies_cart";

type Product = { id: string | number; name: string; description?: string; unit: string; price: number; isActive?: boolean; };
type CartItem = Product & { quantity: number; };
type Slot = { id: string | number; name: string; startTime: string; endTime: string; };
type Order = { id: string | number; status: string; totalAmount: number; deliverySlot?: Slot; createdAt: string; items?: { product: Product; quantity: number; unitPrice: number }[]; };

const Stack = createNativeStackNavigator();

async function api(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function money(value: number) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function Button({ title, onPress, disabled=false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{title}</Text></Pressable>;
}

function Field({ value, onChangeText, placeholder, secureTextEntry=false, keyboardType }: any) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secureTextEntry} keyboardType={keyboardType} style={styles.input} autoCapitalize="none" />;
}

function AuthScreen({ navigation, mode, onLogin }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      let data: any;
      if (mode === "login") {
        data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      } else {
        try {
          data = await api("/auth/register", { method: "POST", body: JSON.stringify({ name, phone, email, password }) });
        } catch (regErr: any) {
          // Fallback to /auth/signup if /auth/register is not mounted
          data = await api("/auth/signup", { method: "POST", body: JSON.stringify({ name, phone, email, password }) });
        }
      }
      const token = data.token || data.accessToken;
      if (!token) throw new Error("The server did not return a token.");
      await AsyncStorage.setItem(TOKEN_KEY, token);
      onLogin(token);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Unable to continue");
    } finally { setBusy(false); }
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.auth}>
    <Text style={styles.logo}>🥕 Fresh Veggies</Text>
    <Text style={styles.subtitle}>{mode === "login" ? "Sign in to order fresh vegetables" : "Create your customer account"}</Text>
    {mode === "register" && <>
      <Field value={name} onChangeText={setName} placeholder="Full name" />
      <Field value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
    </>}
    <Field value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
    <Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
    <Button title={busy ? "Please wait..." : mode === "login" ? "Login" : "Register"} onPress={submit} disabled={busy} />
    <Pressable onPress={() => navigation.replace(mode === "login" ? "Register" : "Login")}><Text style={styles.link}>{mode === "login" ? "Create an account" : "Already have an account? Login"}</Text></Pressable>
    <Text style={[styles.muted, { textAlign: "center", fontSize: 11, marginTop: 24 }]}>Server: {API_URL}</Text>
  </ScrollView></SafeAreaView>;
}

function HomeScreen({ navigation, token }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(true);

  async function load() {
    try {
      const data = await api("/products", {}, token);
      setProducts(data.products || data || []);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(product: Product) {
    const raw = await AsyncStorage.getItem(CART_KEY);
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    const existing = cart.find(x => x.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
    Alert.alert("Added", `${product.name} added to cart.`);
  }

  if (busy) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><View><Text style={styles.title}>Fresh Vegetables</Text><Text style={styles.muted}>Next-day delivery</Text></View><Button title="Cart" onPress={() => navigation.navigate("Cart")} /></View>
    <FlatList data={products} keyExtractor={x => String(x.id)} contentContainerStyle={styles.list} renderItem={({item}) =>
      <View style={styles.card}>
        <View style={{flex:1}}><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.muted}>{item.description || `Fresh ${item.name}`}</Text><Text style={styles.price}>{money(item.price)} / {item.unit}</Text></View>
        <Pressable style={styles.smallButton} onPress={() => add(item)}><Text style={styles.smallButtonText}>+ Add</Text></Pressable>
      </View>
    } ListEmptyComponent={<Text style={styles.muted}>No vegetables available.</Text>} />
    <View style={styles.bottomNav}><Pressable onPress={() => navigation.navigate("Orders")}><Text>📦 Orders</Text></Pressable><Pressable onPress={() => navigation.navigate("Cart")}><Text>🛒 Cart</Text></Pressable></View>
  </SafeAreaView>;
}

function CartScreen({ navigation, token }: any) {
  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => { AsyncStorage.getItem(CART_KEY).then(x => setCart(x ? JSON.parse(x) : [])); }, []);
  const total = useMemo(() => cart.reduce((s,x) => s + x.price*x.quantity, 0), [cart]);

  async function update(id: string | number, delta: number) {
    const next = cart.map(x => x.id === id ? {...x, quantity: x.quantity + delta} : x).filter(x => x.quantity > 0);
    setCart(next); await AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
  }
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.list}>
    <Text style={styles.title}>Your Cart</Text>
    {cart.map(item => <View style={styles.card} key={String(item.id)}><View style={{flex:1}}><Text style={styles.cardTitle}>{item.name}</Text><Text>{money(item.price)} × {item.quantity}</Text></View><View style={styles.row}><Pressable style={styles.qty} onPress={() => update(item.id,-1)}><Text>−</Text></Pressable><Text style={styles.qtyText}>{item.quantity}</Text><Pressable style={styles.qty} onPress={() => update(item.id,1)}><Text>+</Text></Pressable></View></View>)}
    <Text style={styles.total}>Total: {money(total)}</Text>
    <Button title="Continue to delivery" onPress={() => navigation.navigate("Checkout")} disabled={!cart.length} />
    <Button title="Continue shopping" onPress={() => navigation.goBack()} />
  </ScrollView></SafeAreaView>;
}

function CheckoutScreen({ navigation, token }: any) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD"|"UPI">("COD");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/delivery-slots", {}, token)
      .catch(() => api("/delivery/slots", {}, token))
      .then(d => setSlots(Array.isArray(d) ? d : (d.slots || [])))
      .catch(e => Alert.alert("Error", e.message));
  }, []);

  async function placeOrder() {
    if (!address.trim() || !slotId) { Alert.alert("Missing information", "Please enter an address and choose a delivery slot."); return; }
    const raw = await AsyncStorage.getItem(CART_KEY); const cart: CartItem[] = raw ? JSON.parse(raw) : [];
    if (!cart.length) { Alert.alert("Cart empty"); return; }
    setBusy(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const deliveryDate = tomorrow.toISOString().split("T")[0];

    try {
      const data = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          address,
          addressId: Number(address) || undefined,
          slotId: Number(slotId) || slotId,
          deliverySlotId: Number(slotId) || slotId,
          deliveryDate,
          paymentMethod,
          items: cart.map(x => ({ productId: Number(x.id) || x.id, quantity: Number(x.quantity) }))
        })
      }, token);
      await AsyncStorage.removeItem(CART_KEY);
      Alert.alert("Order placed", `Order #${data.order?.id || data.id || ""} created successfully.`);
      navigation.replace("Orders");
    } catch (e: any) { Alert.alert("Order failed", e.message); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.list}>
    <Text style={styles.title}>Delivery & Payment</Text>
    <Text style={styles.label}>Delivery address</Text>
    <TextInput value={address} onChangeText={setAddress} placeholder="House, street, area, PIN code" multiline style={[styles.input,{height:90,textAlignVertical:"top"}]} />
    <Text style={styles.label}>Next-day delivery slot</Text>
    {slots.map(s => <Pressable key={String(s.id)} onPress={() => setSlotId(String(s.id))} style={[styles.option, slotId===String(s.id) && styles.selected]}><Text style={styles.cardTitle}>{s.name}</Text><Text>{s.startTime} – {s.endTime}</Text></Pressable>)}
    <Text style={styles.label}>Payment method</Text>
    {(["COD","UPI"] as const).map(p => <Pressable key={p} onPress={() => setPaymentMethod(p)} style={[styles.option, paymentMethod===p && styles.selected]}><Text>{p === "COD" ? "💵 Cash on Delivery" : "📱 UPI"}</Text></Pressable>)}
    <Button title={busy ? "Placing order..." : "Place order"} onPress={placeOrder} disabled={busy} />
  </ScrollView></SafeAreaView>;
}

function OrdersScreen({ navigation, token }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => { api("/orders", {}, token).then(d => setOrders(Array.isArray(d) ? d : (d.orders || []))).catch(e => Alert.alert("Error", e.message)); }, []);
  return <SafeAreaView style={styles.safe}><FlatList data={orders} keyExtractor={x=>String(x.id)} contentContainerStyle={styles.list} ListHeaderComponent={<Text style={styles.title}>My Orders</Text>} renderItem={({item}) =>
    <Pressable style={styles.card} onPress={() => navigation.navigate("OrderDetails",{orderId:item.id})}>
      <View style={{flex:1}}><Text style={styles.cardTitle}>Order #{String(item.id).slice(0,8)}</Text><Text>Status: {item.status}</Text><Text style={styles.price}>{money(item.totalAmount)}</Text></View><Text>›</Text>
    </Pressable>
  } ListEmptyComponent={<Text style={styles.muted}>No orders yet.</Text>} /></SafeAreaView>;
}

function OrderDetailsScreen({ route, token }: any) {
  const [order, setOrder] = useState<Order|null>(null);
  useEffect(() => { api(`/orders/${route.params.orderId}`, {}, token).then(d => setOrder(d.order || d)).catch(e => Alert.alert("Error",e.message)); }, []);
  if (!order) return <View style={styles.center}><ActivityIndicator size="large"/></View>;
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.list}>
    <Text style={styles.title}>Order Details</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>#{order.id}</Text><Text>Status: {order.status}</Text><Text>Total: {money(order.totalAmount)}</Text></View>
    {(order.items || []).map((x:any) => <View style={styles.card} key={String(x.product?.id || x.id || Math.random())}><Text>{x.product?.name || "Item"}</Text><Text>{x.quantity} × {money(x.unitPrice)}</Text></View>)}
    <View style={styles.option}><Text style={styles.cardTitle}>Delivery tracking</Text><Text style={styles.muted}>Live driver tracking will be enabled in Phase 3 when the driver app and Socket.IO tracking are connected.</Text></View>
  </ScrollView></SafeAreaView>;
}

export default function App() {
  const [token, setToken] = useState<string|null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { AsyncStorage.getItem(TOKEN_KEY).then(setToken).finally(() => setReady(true)); }, []);
  if (!ready) return <View style={styles.center}><ActivityIndicator size="large"/></View>;

  return <NavigationContainer><StatusBar style="auto"/>
    <Stack.Navigator>
      {!token ? <>
        <Stack.Screen name="Login" options={{headerShown:false}}>{p => <AuthScreen {...p} mode="login" onLogin={setToken}/>}</Stack.Screen>
        <Stack.Screen name="Register" options={{title:"Create account"}}>{p => <AuthScreen {...p} mode="register" onLogin={setToken}/>}</Stack.Screen>
      </> : <>
        <Stack.Screen name="Home" options={{headerShown:false}}>{p => <HomeScreen {...p} token={token}/>}</Stack.Screen>
        <Stack.Screen name="Cart">{p => <CartScreen {...p} token={token}/>}</Stack.Screen>
        <Stack.Screen name="Checkout">{p => <CheckoutScreen {...p} token={token}/>}</Stack.Screen>
        <Stack.Screen name="Orders">{p => <OrdersScreen {...p} token={token}/>}</Stack.Screen>
        <Stack.Screen name="OrderDetails" options={{title:"Order"}}>{p => <OrderDetailsScreen {...p} token={token}/>}</Stack.Screen>
      </>}
    </Stack.Navigator>
  </NavigationContainer>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#fff"}, center:{flex:1,alignItems:"center",justifyContent:"center"},
  auth:{padding:24,flexGrow:1,justifyContent:"center"}, logo:{fontSize:30,fontWeight:"800",textAlign:"center",marginBottom:8},
  subtitle:{textAlign:"center",color:"#666",marginBottom:28}, input:{borderWidth:1,borderColor:"#ddd",borderRadius:10,padding:14,marginBottom:12,fontSize:16,backgroundColor:"#fafafa"},
  button:{backgroundColor:"#1b7f3a",padding:14,borderRadius:10,alignItems:"center",marginVertical:6}, buttonText:{color:"#fff",fontWeight:"700",fontSize:16},
  disabled:{opacity:.5}, link:{textAlign:"center",color:"#1b7f3a",marginTop:16,fontWeight:"600"}, header:{padding:18,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  title:{fontSize:24,fontWeight:"800",marginBottom:14}, muted:{color:"#666"}, list:{padding:16}, card:{borderWidth:1,borderColor:"#e5e5e5",borderRadius:12,padding:15,marginBottom:12,flexDirection:"row",alignItems:"center",backgroundColor:"#fff"},
  cardTitle:{fontWeight:"700",fontSize:17,marginBottom:4}, price:{fontWeight:"800",fontSize:16,marginTop:8}, smallButton:{backgroundColor:"#1b7f3a",paddingVertical:10,paddingHorizontal:14,borderRadius:8}, smallButtonText:{color:"#fff",fontWeight:"700"},
  bottomNav:{borderTopWidth:1,borderColor:"#eee",padding:14,flexDirection:"row",justifyContent:"space-around"}, row:{flexDirection:"row",alignItems:"center"}, qty:{borderWidth:1,borderColor:"#ccc",borderRadius:8,padding:8,minWidth:38,alignItems:"center"}, qtyText:{paddingHorizontal:12,fontWeight:"700"},
  total:{fontSize:22,fontWeight:"800",marginVertical:18}, label:{fontWeight:"700",fontSize:16,marginTop:8,marginBottom:8}, option:{borderWidth:1,borderColor:"#ddd",borderRadius:10,padding:14,marginBottom:10}, selected:{borderColor:"#1b7f3a",backgroundColor:"#eef9f1"}
});
