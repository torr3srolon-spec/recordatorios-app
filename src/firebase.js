import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIRzsCSuyAL8IcGhw2bAWoGcVH-EFnoMA",
  authDomain: "autenticacion-5f332.firebaseapp.com",
  projectId: "autenticacion-5f332",
  storageBucket: "autenticacion-5f332.appspot.com",
  messagingSenderId: "1058167820348",
  appId: "1:1058167820348:web:53049452f1d916ee26b339",
  measurementId: "G-M6K68B5ZY4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);      
export const db = getFirestore(app);   