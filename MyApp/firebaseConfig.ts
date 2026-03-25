import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAzs6dPlWE8MRzz739tFIqGIjc_YfO7-Xs",
  authDomain: "early-literacy-app-6d0e3.firebaseapp.com",
  projectId: "early-literacy-app-6d0e3",
  storageBucket: "early-literacy-app-6d0e3.firebasestorage.app",
  messagingSenderId: "837966183569",
  appId: "1:837966183569:web:ec82cc56bf203b50075330",
  measurementId: "G-Q0BWWMLX4E"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
