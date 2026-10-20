import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Credenciales públicas del proyecto Firebase
const firebaseConfig = {

  apiKey: "AIzaSyDv_kJiDpfUHmUTa_IgIK6Sez18i24DXaI",

  authDomain: "trc-app-c46ea.firebaseapp.com",

  projectId: "trc-app-c46ea",

  storageBucket: "trc-app-c46ea.firebasestorage.app",

  messagingSenderId: "568420718073",

  appId: "1:568420718073:web:ccaf11e86384c9041c5928",

  measurementId: "G-VX9BZ1B6JR"

};


// Inicialización de la App de Firebase
const app = initializeApp( firebaseConfig );

// Inicializamos Auth con la persistencia nativa de AsyncStorage
export const auth = initializeAuth( app, {
  persistence: getReactNativePersistence( AsyncStorage ),
} );