import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDv_kJiDpfUHmUTa_IgIK6Sez18i24DXaI",
  authDomain: "trc-app-c46ea.firebaseapp.com", 
  projectId: "trc-app-c46ea",
  storageBucket: "trc-app-c46ea.firebasestorage.app",
  messagingSenderId: "568420718073",
  appId: "1:568420718073:web:ccaf11e86384c9041c5928",
  measurementId: "G-VX9BZ1B6JR"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require("firebase/auth");

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

export const db = getFirestore(app);
export { auth, db };
