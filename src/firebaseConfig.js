import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAMaQDK5A6P1fNenYjvID3Yy8lAqCulrrM",
  authDomain: "youthealth.firebaseapp.com",
  projectId: "youthealth",
  storageBucket: "youthealth.appspot.com",
  messagingSenderId: "454261597136",
  appId: "1:454261597136:web:5305da23c45823ebbb0fd5",
  measurementId: "G-GKKSX0QF4M",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🧠 Initialize Analytics only if supported (avoids SSR / Vite build errors)
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

// ✅ Auth with local persistence (keeps user logged in after refresh)
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase Auth persistence: browserLocalPersistence enabled"))
  .catch((err) => console.error("⚠️ Failed to set persistence:", err));

// ✅ Firestore
const db = getFirestore(app);

// 🧰 Optional: expose for debugging in browser console (only in dev)
if (import.meta.env.MODE === "development") {
  if (typeof window !== "undefined") {
    window.auth = auth;
    window.db = db;
  }
}

// ✅ Export everything needed throughout your app
export {
  app,
  auth,
  db,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
};
