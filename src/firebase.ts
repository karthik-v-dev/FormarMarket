import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getDataConnect } from "firebase/data-connect";
import {
  connectorConfig,
  listProducts,
  listDeliverySlots,
  listOrders,
  getOrder,
  createUser,
  createOrder,
  addOrderItem,
  createAddress,
} from "./lib/dataconnect";

export const firebaseConfig = {
  projectId: "formersmarket-d864c",
  appId: "1:321129523421:web:331722754dc625e49e5334",
  databaseURL: "https://formersmarket-d864c-default-rtdb.firebaseio.com",
  storageBucket: "formersmarket-d864c.firebasestorage.app",
  apiKey: "AIzaSyCxRzfo-K2XNrNniiq5THlo9fnrp0IHmX0",
  authDomain: "formersmarket-d864c.firebaseapp.com",
  messagingSenderId: "321129523421",
  measurementId: "G-8SP751Y3M9",
  projectNumber: "321129523421"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const rtdb: Database = getDatabase(app);
export const dc = getDataConnect(app, connectorConfig);

export {
  listProducts,
  listDeliverySlots,
  listOrders,
  getOrder,
  createUser,
  createOrder,
  addOrderItem,
  createAddress,
};
