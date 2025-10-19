import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMaQDK5A6P1fNenYjvID3Yy8lAqCulrrM",
  authDomain: "youthealth.firebaseapp.com",
  projectId: "youthealth",
  storageBucket: "youthealth.firebasestorage.app",
  messagingSenderId: "454261597136",
  appId: "1:454261597136:web:5305da23c45823ebbb0fd5",
  measurementId: "G-GKKSX0QF4M"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// ✅ Auth & persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

// ✅ Firestore
const db = getFirestore(app);

// ✅ Expose for console debugging (optional)
if (typeof window !== "undefined") {
  window.auth = auth;
  window.db = db;
}

export { app, auth, db, onAuthStateChanged, collection, addDoc, getDocs };
