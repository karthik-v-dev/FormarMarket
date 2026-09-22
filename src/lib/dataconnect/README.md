# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListProducts*](#listproducts)
  - [*GetProduct*](#getproduct)
  - [*ListDeliverySlots*](#listdeliveryslots)
  - [*ListOrders*](#listorders)
  - [*GetOrder*](#getorder)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*CreateProduct*](#createproduct)
  - [*UpdateInventoryStock*](#updateinventorystock)
  - [*CreateAddress*](#createaddress)
  - [*CreateOrder*](#createorder)
  - [*AddOrderItem*](#addorderitem)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@formersmarket/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@formersmarket/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@formersmarket/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListProducts
You can execute the `ListProducts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listProducts(options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface ListProductsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListProductsData, undefined>;
}
export const listProductsRef: ListProductsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listProducts(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListProductsData, undefined>;

interface ListProductsRef {
  ...
  (dc: DataConnect): QueryRef<ListProductsData, undefined>;
}
export const listProductsRef: ListProductsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listProductsRef:
```typescript
const name = listProductsRef.operationName;
console.log(name);
```

### Variables
The `ListProducts` query has no variables.
### Return Type
Recall that executing the `ListProducts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListProductsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListProducts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listProducts } from '@formersmarket/dataconnect';


// Call the `listProducts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listProducts();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listProducts(dataConnect);

console.log(data.products);

// Or, you can use the `Promise` API.
listProducts().then((response) => {
  const data = response.data;
  console.log(data.products);
});
```

### Using `ListProducts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listProductsRef } from '@formersmarket/dataconnect';


// Call the `listProductsRef()` function to get a reference to the query.
const ref = listProductsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listProductsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.products);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.products);
});
```

## GetProduct
You can execute the `GetProduct` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getProduct(vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface GetProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
}
export const getProductRef: GetProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getProduct(dc: DataConnect, vars: GetProductVariables, options?: ExecuteQueryOptions): QueryPromise<GetProductData, GetProductVariables>;

interface GetProductRef {
  ...
  (dc: DataConnect, vars: GetProductVariables): QueryRef<GetProductData, GetProductVariables>;
}
export const getProductRef: GetProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getProductRef:
```typescript
const name = getProductRef.operationName;
console.log(name);
```

### Variables
The `GetProduct` query requires an argument of type `GetProductVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetProductVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetProduct` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetProductData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getProduct, GetProductVariables } from '@formersmarket/dataconnect';

// The `GetProduct` query requires an argument of type `GetProductVariables`:
const getProductVars: GetProductVariables = {
  id: ..., 
};

// Call the `getProduct()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getProduct(getProductVars);
// Variables can be defined inline as well.
const { data } = await getProduct({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getProduct(dataConnect, getProductVars);

console.log(data.product);

// Or, you can use the `Promise` API.
getProduct(getProductVars).then((response) => {
  const data = response.data;
  console.log(data.product);
});
```

### Using `GetProduct`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getProductRef, GetProductVariables } from '@formersmarket/dataconnect';

// The `GetProduct` query requires an argument of type `GetProductVariables`:
const getProductVars: GetProductVariables = {
  id: ..., 
};

// Call the `getProductRef()` function to get a reference to the query.
const ref = getProductRef(getProductVars);
// Variables can be defined inline as well.
const ref = getProductRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getProductRef(dataConnect, getProductVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.product);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.product);
});
```

## ListDeliverySlots
You can execute the `ListDeliverySlots` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listDeliverySlots(options?: ExecuteQueryOptions): QueryPromise<ListDeliverySlotsData, undefined>;

interface ListDeliverySlotsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDeliverySlotsData, undefined>;
}
export const listDeliverySlotsRef: ListDeliverySlotsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDeliverySlots(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDeliverySlotsData, undefined>;

interface ListDeliverySlotsRef {
  ...
  (dc: DataConnect): QueryRef<ListDeliverySlotsData, undefined>;
}
export const listDeliverySlotsRef: ListDeliverySlotsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDeliverySlotsRef:
```typescript
const name = listDeliverySlotsRef.operationName;
console.log(name);
```

### Variables
The `ListDeliverySlots` query has no variables.
### Return Type
Recall that executing the `ListDeliverySlots` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDeliverySlotsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListDeliverySlotsData {
  deliverySlots: ({
    id: UUIDString;
    name: string;
    startTime: string;
    endTime: string;
    capacity: number;
  } & DeliverySlot_Key)[];
}
```
### Using `ListDeliverySlots`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDeliverySlots } from '@formersmarket/dataconnect';


// Call the `listDeliverySlots()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDeliverySlots();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDeliverySlots(dataConnect);

console.log(data.deliverySlots);

// Or, you can use the `Promise` API.
listDeliverySlots().then((response) => {
  const data = response.data;
  console.log(data.deliverySlots);
});
```

### Using `ListDeliverySlots`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDeliverySlotsRef } from '@formersmarket/dataconnect';


// Call the `listDeliverySlotsRef()` function to get a reference to the query.
const ref = listDeliverySlotsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDeliverySlotsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.deliverySlots);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.deliverySlots);
});
```

## ListOrders
You can execute the `ListOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
listOrders(vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface ListOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
}
export const listOrdersRef: ListOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrders(dc: DataConnect, vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface ListOrdersRef {
  ...
  (dc: DataConnect, vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
}
export const listOrdersRef: ListOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrdersRef:
```typescript
const name = listOrdersRef.operationName;
console.log(name);
```

### Variables
The `ListOrders` query requires an argument of type `ListOrdersVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListOrdersVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `ListOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrdersData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrders, ListOrdersVariables } from '@formersmarket/dataconnect';

// The `ListOrders` query requires an argument of type `ListOrdersVariables`:
const listOrdersVars: ListOrdersVariables = {
  userId: ..., 
};

// Call the `listOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrders(listOrdersVars);
// Variables can be defined inline as well.
const { data } = await listOrders({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrders(dataConnect, listOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
listOrders(listOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `ListOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrdersRef, ListOrdersVariables } from '@formersmarket/dataconnect';

// The `ListOrders` query requires an argument of type `ListOrdersVariables`:
const listOrdersVars: ListOrdersVariables = {
  userId: ..., 
};

// Call the `listOrdersRef()` function to get a reference to the query.
const ref = listOrdersRef(listOrdersVars);
// Variables can be defined inline as well.
const ref = listOrdersRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrdersRef(dataConnect, listOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetOrder
You can execute the `GetOrder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getOrder(vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

interface GetOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
}
export const getOrderRef: GetOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getOrder(dc: DataConnect, vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

interface GetOrderRef {
  ...
  (dc: DataConnect, vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
}
export const getOrderRef: GetOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getOrderRef:
```typescript
const name = getOrderRef.operationName;
console.log(name);
```

### Variables
The `GetOrder` query requires an argument of type `GetOrderVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetOrderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetOrder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetOrderData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getOrder, GetOrderVariables } from '@formersmarket/dataconnect';

// The `GetOrder` query requires an argument of type `GetOrderVariables`:
const getOrderVars: GetOrderVariables = {
  id: ..., 
};

// Call the `getOrder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getOrder(getOrderVars);
// Variables can be defined inline as well.
const { data } = await getOrder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getOrder(dataConnect, getOrderVars);

console.log(data.order);

// Or, you can use the `Promise` API.
getOrder(getOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

### Using `GetOrder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getOrderRef, GetOrderVariables } from '@formersmarket/dataconnect';

// The `GetOrder` query requires an argument of type `GetOrderVariables`:
const getOrderVars: GetOrderVariables = {
  id: ..., 
};

// Call the `getOrderRef()` function to get a reference to the query.
const ref = getOrderRef(getOrderVars);
// Variables can be defined inline as well.
const ref = getOrderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getOrderRef(dataConnect, getOrderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.order);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateUserRef {
  ...
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation requires an argument of type `CreateUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserVariables {
  name: string;
  email: string;
  phone?: string | null;
}
```
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser, CreateUserVariables } from '@formersmarket/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  name: ..., 
  email: ..., 
  phone: ..., // optional
};

// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser(createUserVars);
// Variables can be defined inline as well.
const { data } = await createUser({ name: ..., email: ..., phone: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect, createUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser(createUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef, CreateUserVariables } from '@formersmarket/dataconnect';

// The `CreateUser` mutation requires an argument of type `CreateUserVariables`:
const createUserVars: CreateUserVariables = {
  name: ..., 
  email: ..., 
  phone: ..., // optional
};

// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef(createUserVars);
// Variables can be defined inline as well.
const ref = createUserRef({ name: ..., email: ..., phone: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect, createUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateProduct
You can execute the `CreateProduct` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createProduct(vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createProduct(dc: DataConnect, vars: CreateProductVariables): MutationPromise<CreateProductData, CreateProductVariables>;

interface CreateProductRef {
  ...
  (dc: DataConnect, vars: CreateProductVariables): MutationRef<CreateProductData, CreateProductVariables>;
}
export const createProductRef: CreateProductRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createProductRef:
```typescript
const name = createProductRef.operationName;
console.log(name);
```

### Variables
The `CreateProduct` mutation requires an argument of type `CreateProductVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateProductVariables {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  unit: string;
}
```
### Return Type
Recall that executing the `CreateProduct` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateProductData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateProductData {
  product_insert: Product_Key;
}
```
### Using `CreateProduct`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createProduct, CreateProductVariables } from '@formersmarket/dataconnect';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  imageUrl: ..., // optional
  unit: ..., 
};

// Call the `createProduct()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createProduct(createProductVars);
// Variables can be defined inline as well.
const { data } = await createProduct({ name: ..., description: ..., price: ..., imageUrl: ..., unit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createProduct(dataConnect, createProductVars);

console.log(data.product_insert);

// Or, you can use the `Promise` API.
createProduct(createProductVars).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
});
```

### Using `CreateProduct`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createProductRef, CreateProductVariables } from '@formersmarket/dataconnect';

// The `CreateProduct` mutation requires an argument of type `CreateProductVariables`:
const createProductVars: CreateProductVariables = {
  name: ..., 
  description: ..., // optional
  price: ..., 
  imageUrl: ..., // optional
  unit: ..., 
};

// Call the `createProductRef()` function to get a reference to the mutation.
const ref = createProductRef(createProductVars);
// Variables can be defined inline as well.
const ref = createProductRef({ name: ..., description: ..., price: ..., imageUrl: ..., unit: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createProductRef(dataConnect, createProductVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.product_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.product_insert);
});
```

## UpdateInventoryStock
You can execute the `UpdateInventoryStock` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateInventoryStock(vars: UpdateInventoryStockVariables): MutationPromise<UpdateInventoryStockData, UpdateInventoryStockVariables>;

interface UpdateInventoryStockRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateInventoryStockVariables): MutationRef<UpdateInventoryStockData, UpdateInventoryStockVariables>;
}
export const updateInventoryStockRef: UpdateInventoryStockRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateInventoryStock(dc: DataConnect, vars: UpdateInventoryStockVariables): MutationPromise<UpdateInventoryStockData, UpdateInventoryStockVariables>;

interface UpdateInventoryStockRef {
  ...
  (dc: DataConnect, vars: UpdateInventoryStockVariables): MutationRef<UpdateInventoryStockData, UpdateInventoryStockVariables>;
}
export const updateInventoryStockRef: UpdateInventoryStockRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateInventoryStockRef:
```typescript
const name = updateInventoryStockRef.operationName;
console.log(name);
```

### Variables
The `UpdateInventoryStock` mutation requires an argument of type `UpdateInventoryStockVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateInventoryStockVariables {
  productId: UUIDString;
  quantity: number;
}
```
### Return Type
Recall that executing the `UpdateInventoryStock` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateInventoryStockData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateInventoryStockData {
  inventory_upsert: Inventory_Key;
}
```
### Using `UpdateInventoryStock`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateInventoryStock, UpdateInventoryStockVariables } from '@formersmarket/dataconnect';

// The `UpdateInventoryStock` mutation requires an argument of type `UpdateInventoryStockVariables`:
const updateInventoryStockVars: UpdateInventoryStockVariables = {
  productId: ..., 
  quantity: ..., 
};

// Call the `updateInventoryStock()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateInventoryStock(updateInventoryStockVars);
// Variables can be defined inline as well.
const { data } = await updateInventoryStock({ productId: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateInventoryStock(dataConnect, updateInventoryStockVars);

console.log(data.inventory_upsert);

// Or, you can use the `Promise` API.
updateInventoryStock(updateInventoryStockVars).then((response) => {
  const data = response.data;
  console.log(data.inventory_upsert);
});
```

### Using `UpdateInventoryStock`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateInventoryStockRef, UpdateInventoryStockVariables } from '@formersmarket/dataconnect';

// The `UpdateInventoryStock` mutation requires an argument of type `UpdateInventoryStockVariables`:
const updateInventoryStockVars: UpdateInventoryStockVariables = {
  productId: ..., 
  quantity: ..., 
};

// Call the `updateInventoryStockRef()` function to get a reference to the mutation.
const ref = updateInventoryStockRef(updateInventoryStockVars);
// Variables can be defined inline as well.
const ref = updateInventoryStockRef({ productId: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateInventoryStockRef(dataConnect, updateInventoryStockVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.inventory_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.inventory_upsert);
});
```

## CreateAddress
You can execute the `CreateAddress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAddress(vars: CreateAddressVariables): MutationPromise<CreateAddressData, CreateAddressVariables>;

interface CreateAddressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAddressVariables): MutationRef<CreateAddressData, CreateAddressVariables>;
}
export const createAddressRef: CreateAddressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAddress(dc: DataConnect, vars: CreateAddressVariables): MutationPromise<CreateAddressData, CreateAddressVariables>;

interface CreateAddressRef {
  ...
  (dc: DataConnect, vars: CreateAddressVariables): MutationRef<CreateAddressData, CreateAddressVariables>;
}
export const createAddressRef: CreateAddressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAddressRef:
```typescript
const name = createAddressRef.operationName;
console.log(name);
```

### Variables
The `CreateAddress` mutation requires an argument of type `CreateAddressVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateAddressVariables {
  userId: UUIDString;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
}
```
### Return Type
Recall that executing the `CreateAddress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAddressData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAddressData {
  address_insert: Address_Key;
}
```
### Using `CreateAddress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAddress, CreateAddressVariables } from '@formersmarket/dataconnect';

// The `CreateAddress` mutation requires an argument of type `CreateAddressVariables`:
const createAddressVars: CreateAddressVariables = {
  userId: ..., 
  line1: ..., 
  line2: ..., // optional
  city: ..., 
  state: ..., 
  pincode: ..., 
};

// Call the `createAddress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAddress(createAddressVars);
// Variables can be defined inline as well.
const { data } = await createAddress({ userId: ..., line1: ..., line2: ..., city: ..., state: ..., pincode: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAddress(dataConnect, createAddressVars);

console.log(data.address_insert);

// Or, you can use the `Promise` API.
createAddress(createAddressVars).then((response) => {
  const data = response.data;
  console.log(data.address_insert);
});
```

### Using `CreateAddress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAddressRef, CreateAddressVariables } from '@formersmarket/dataconnect';

// The `CreateAddress` mutation requires an argument of type `CreateAddressVariables`:
const createAddressVars: CreateAddressVariables = {
  userId: ..., 
  line1: ..., 
  line2: ..., // optional
  city: ..., 
  state: ..., 
  pincode: ..., 
};

// Call the `createAddressRef()` function to get a reference to the mutation.
const ref = createAddressRef(createAddressVars);
// Variables can be defined inline as well.
const ref = createAddressRef({ userId: ..., line1: ..., line2: ..., city: ..., state: ..., pincode: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAddressRef(dataConnect, createAddressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.address_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.address_insert);
});
```

## CreateOrder
You can execute the `CreateOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrderRef:
```typescript
const name = createOrderRef.operationName;
console.log(name);
```

### Variables
The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateOrderVariables {
  userId: UUIDString;
  addressId?: UUIDString | null;
  deliverySlotId: UUIDString;
  totalAmount: number;
  paymentMethod: string;
  deliveryDate: DateString;
}
```
### Return Type
Recall that executing the `CreateOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrderData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrderData {
  order_insert: Order_Key;
}
```
### Using `CreateOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrder, CreateOrderVariables } from '@formersmarket/dataconnect';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  userId: ..., 
  addressId: ..., // optional
  deliverySlotId: ..., 
  totalAmount: ..., 
  paymentMethod: ..., 
  deliveryDate: ..., 
};

// Call the `createOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrder(createOrderVars);
// Variables can be defined inline as well.
const { data } = await createOrder({ userId: ..., addressId: ..., deliverySlotId: ..., totalAmount: ..., paymentMethod: ..., deliveryDate: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrder(dataConnect, createOrderVars);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
createOrder(createOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

### Using `CreateOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrderRef, CreateOrderVariables } from '@formersmarket/dataconnect';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  userId: ..., 
  addressId: ..., // optional
  deliverySlotId: ..., 
  totalAmount: ..., 
  paymentMethod: ..., 
  deliveryDate: ..., 
};

// Call the `createOrderRef()` function to get a reference to the mutation.
const ref = createOrderRef(createOrderVars);
// Variables can be defined inline as well.
const ref = createOrderRef({ userId: ..., addressId: ..., deliverySlotId: ..., totalAmount: ..., paymentMethod: ..., deliveryDate: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrderRef(dataConnect, createOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

## AddOrderItem
You can execute the `AddOrderItem` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
addOrderItem(vars: AddOrderItemVariables): MutationPromise<AddOrderItemData, AddOrderItemVariables>;

interface AddOrderItemRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddOrderItemVariables): MutationRef<AddOrderItemData, AddOrderItemVariables>;
}
export const addOrderItemRef: AddOrderItemRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addOrderItem(dc: DataConnect, vars: AddOrderItemVariables): MutationPromise<AddOrderItemData, AddOrderItemVariables>;

interface AddOrderItemRef {
  ...
  (dc: DataConnect, vars: AddOrderItemVariables): MutationRef<AddOrderItemData, AddOrderItemVariables>;
}
export const addOrderItemRef: AddOrderItemRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addOrderItemRef:
```typescript
const name = addOrderItemRef.operationName;
console.log(name);
```

### Variables
The `AddOrderItem` mutation requires an argument of type `AddOrderItemVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddOrderItemVariables {
  orderId: UUIDString;
  productId: UUIDString;
  quantity: number;
  unitPrice: number;
}
```
### Return Type
Recall that executing the `AddOrderItem` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddOrderItemData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddOrderItemData {
  orderItem_insert: OrderItem_Key;
}
```
### Using `AddOrderItem`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addOrderItem, AddOrderItemVariables } from '@formersmarket/dataconnect';

// The `AddOrderItem` mutation requires an argument of type `AddOrderItemVariables`:
const addOrderItemVars: AddOrderItemVariables = {
  orderId: ..., 
  productId: ..., 
  quantity: ..., 
  unitPrice: ..., 
};

// Call the `addOrderItem()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addOrderItem(addOrderItemVars);
// Variables can be defined inline as well.
const { data } = await addOrderItem({ orderId: ..., productId: ..., quantity: ..., unitPrice: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addOrderItem(dataConnect, addOrderItemVars);

console.log(data.orderItem_insert);

// Or, you can use the `Promise` API.
addOrderItem(addOrderItemVars).then((response) => {
  const data = response.data;
  console.log(data.orderItem_insert);
});
```

### Using `AddOrderItem`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addOrderItemRef, AddOrderItemVariables } from '@formersmarket/dataconnect';

// The `AddOrderItem` mutation requires an argument of type `AddOrderItemVariables`:
const addOrderItemVars: AddOrderItemVariables = {
  orderId: ..., 
  productId: ..., 
  quantity: ..., 
  unitPrice: ..., 
};

// Call the `addOrderItemRef()` function to get a reference to the mutation.
const ref = addOrderItemRef(addOrderItemVars);
// Variables can be defined inline as well.
const ref = addOrderItemRef({ orderId: ..., productId: ..., quantity: ..., unitPrice: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addOrderItemRef(dataConnect, addOrderItemVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.orderItem_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.orderItem_insert);
});
```

