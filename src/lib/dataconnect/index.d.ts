import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddOrderItemData {
  orderItem_insert: OrderItem_Key;
}

export interface AddOrderItemVariables {
  orderId: UUIDString;
  productId: UUIDString;
  quantity: number;
  unitPrice: number;
}

export interface Address_Key {
  id: UUIDString;
  __typename?: 'Address_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateAddressData {
  address_insert: Address_Key;
}

export interface CreateAddressVariables {
  userId: UUIDString;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateDeliverySlotData {
  deliverySlot_insert: DeliverySlot_Key;
}

export interface CreateDeliverySlotVariables {
  name: string;
  startTime: string;
  endTime: string;
  capacity?: number | null;
}

export interface CreateOrderData {
  order_insert: Order_Key;
}

export interface CreateOrderVariables {
  userId: UUIDString;
  addressId?: UUIDString | null;
  deliverySlotId: UUIDString;
  totalAmount: number;
  paymentMethod: string;
  deliveryDate: DateString;
}

export interface CreateProductData {
  product_insert: Product_Key;
}

export interface CreateProductVariables {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  unit: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  name: string;
  email: string;
  phone?: string | null;
}

export interface DeliverySlot_Key {
  id: UUIDString;
  __typename?: 'DeliverySlot_Key';
}

export interface GetOrderData {
  order?: {
    id: UUIDString;
    status: string;
    totalAmount: number;
    paymentMethod: string;
    placedAt: TimestampString;
    deliveryDate: DateString;
    address?: {
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      pincode: string;
    };
    deliverySlot?: {
      name: string;
      startTime: string;
      endTime: string;
    };
    orderItems_on_order: ({
      id: UUIDString;
      quantity: number;
      unitPrice?: number | null;
      product: {
        id: UUIDString;
        name: string;
        unit: string;
      } & Product_Key;
    } & OrderItem_Key)[];
  } & Order_Key;
}

export interface GetOrderVariables {
  id: UUIDString;
}

export interface GetProductData {
  product?: {
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    unit: string;
    inventory_on_product?: {
      quantity: number;
    };
  } & Product_Key;
}

export interface GetProductVariables {
  id: UUIDString;
}

export interface Inventory_Key {
  productId: UUIDString;
  __typename?: 'Inventory_Key';
}

export interface ListDeliverySlotsData {
  deliverySlots: ({
    id: UUIDString;
    name: string;
    startTime: string;
    endTime: string;
    capacity: number;
  } & DeliverySlot_Key)[];
}

export interface ListOrdersData {
  orders: ({
    id: UUIDString;
    status: string;
    totalAmount: number;
    paymentMethod: string;
    placedAt: TimestampString;
    deliveryDate: DateString;
    deliverySlot?: {
      id: UUIDString;
      name: string;
      startTime: string;
      endTime: string;
    } & DeliverySlot_Key;
    orderItems_on_order: ({
      id: UUIDString;
      quantity: number;
      unitPrice?: number | null;
      product: {
        id: UUIDString;
        name: string;
        unit: string;
      } & Product_Key;
    } & OrderItem_Key)[];
  } & Order_Key)[];
}

export interface ListOrdersVariables {
  userId: UUIDString;
}

export interface ListProductsData {
  products: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    unit: string;
    inventory_on_product?: {
      quantity: number;
    };
  } & Product_Key)[];
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Product_Key {
  id: UUIDString;
  __typename?: 'Product_Key';
}

export interface UpdateInventoryStockData {
  inventory_upsert: Inventory_Key;
}

export interface UpdateInventoryStockVariables {
  productId: UUIDString;
  quantity: number;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
  operationName: string;
}
export const createProductRef: CreateProductRef;

export function createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;
export function createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface UpdateInventoryStockRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateInventoryStockVariables): MutationRef<UpdateInventoryStockData, UpdateInventoryStockVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateInventoryStockVariables): MutationRef<UpdateInventoryStockData, UpdateInventoryStockVariables>;
  operationName: string;
}
export const updateInventoryStockRef: UpdateInventoryStockRef;

export function updateInventoryStock(vars: UpdateInventoryStockVariables): MutationPromise<UpdateInventoryStockData, UpdateInventoryStockVariables>;
export function updateInventoryStock(dc: DataConnect, vars: UpdateInventoryStockVariables): MutationPromise<UpdateInventoryStockData, UpdateInventoryStockVariables>;

interface CreateAddressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAddressVariables): MutationRef<CreateAddressData, CreateAddressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAddressVariables): MutationRef<CreateAddressData, CreateAddressVariables>;
  operationName: string;
}
export const createAddressRef: CreateAddressRef;

export function createAddress(vars: CreateAddressVariables): MutationPromise<CreateAddressData, CreateAddressVariables>;
export function createAddress(dc: DataConnect, vars: CreateAddressVariables): MutationPromise<CreateAddressData, CreateAddressVariables>;

interface CreateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  operationName: string;
}
export const createOrderRef: CreateOrderRef;

export function createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;
export function createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface AddOrderItemRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddOrderItemVariables): MutationRef<AddOrderItemData, AddOrderItemVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddOrderItemVariables): MutationRef<AddOrderItemData, AddOrderItemVariables>;
  operationName: string;
}
export const addOrderItemRef: AddOrderItemRef;

export function addOrderItem(vars: AddOrderItemVariables): MutationPromise<AddOrderItemData, AddOrderItemVariables>;
export function addOrderItem(dc: DataConnect, vars: AddOrderItemVariables): MutationPromise<AddOrderItemData, AddOrderItemVariables>;

interface CreateDeliverySlotRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDeliverySlotVariables): MutationRef<CreateDeliverySlotData, CreateDeliverySlotVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDeliverySlotVariables): MutationRef<CreateDeliverySlotData, CreateDeliverySlotVariables>;
  operationName: string;
}
export const createDeliverySlotRef: CreateDeliverySlotRef;

export function createDeliverySlot(vars: CreateDeliverySlotVariables): MutationPromise<CreateDeliverySlotData, CreateDeliverySlotVariables>;
export function createDeliverySlot(dc: DataConnect, vars: CreateDeliverySlotVariables): MutationPromise<CreateDeliverySlotData, CreateDeliverySlotVariables>;

interface ListProductsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
  operationName: string;
}
export const listProductsRef: ListProductsRef;

export function listProducts(options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;
export function listProducts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface GetProductRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
  operationName: string;
}
export const getProductRef: GetProductRef;

export function getProduct(vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;
export function getProduct(dc: DataConnect, vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface ListDeliverySlotsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDeliverySlotsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListDeliverySlotsData, undefined>;
  operationName: string;
}
export const listDeliverySlotsRef: ListDeliverySlotsRef;

export function listDeliverySlots(options?: ExecuteQueryOptions): QueryPromise<ListDeliverySlotsData, undefined>;
export function listDeliverySlots(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDeliverySlotsData, undefined>;

interface ListOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
  operationName: string;
}
export const listOrdersRef: ListOrdersRef;

export function listOrders(vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;
export function listOrders(dc: DataConnect, vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface GetOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
  operationName: string;
}
export const getOrderRef: GetOrderRef;

export function getOrder(vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;
export function getOrder(dc: DataConnect, vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

