# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, createProduct, updateInventoryStock, createAddress, createOrder, addOrderItem, listProducts, getProduct, listDeliverySlots, listOrders } from '@formersmarket/dataconnect';


// Operation CreateUser:  For variables, look at type CreateUserVars in ../index.d.ts
const { data } = await CreateUser(dataConnect, createUserVars);

// Operation CreateProduct:  For variables, look at type CreateProductVars in ../index.d.ts
const { data } = await CreateProduct(dataConnect, createProductVars);

// Operation UpdateInventoryStock:  For variables, look at type UpdateInventoryStockVars in ../index.d.ts
const { data } = await UpdateInventoryStock(dataConnect, updateInventoryStockVars);

// Operation CreateAddress:  For variables, look at type CreateAddressVars in ../index.d.ts
const { data } = await CreateAddress(dataConnect, createAddressVars);

// Operation CreateOrder:  For variables, look at type CreateOrderVars in ../index.d.ts
const { data } = await CreateOrder(dataConnect, createOrderVars);

// Operation AddOrderItem:  For variables, look at type AddOrderItemVars in ../index.d.ts
const { data } = await AddOrderItem(dataConnect, addOrderItemVars);

// Operation ListProducts: 
const { data } = await ListProducts(dataConnect);

// Operation GetProduct:  For variables, look at type GetProductVars in ../index.d.ts
const { data } = await GetProduct(dataConnect, getProductVars);

// Operation ListDeliverySlots: 
const { data } = await ListDeliverySlots(dataConnect);

// Operation ListOrders:  For variables, look at type ListOrdersVars in ../index.d.ts
const { data } = await ListOrders(dataConnect, listOrdersVars);


```