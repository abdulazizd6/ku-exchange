/* ===================================================
   Firebase Configuration
   Replace the placeholder values below with your
   actual Firebase project config from:
   Firebase Console → Project Settings → Your apps → SDK setup
   =================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyANWHuB66Kqlap4303WrAqgxQkcSxZEK3Y",
  authDomain: "korea-uzbekistan-exchange.firebaseapp.com",
  projectId: "korea-uzbekistan-exchange",
  storageBucket: "korea-uzbekistan-exchange.firebasestorage.app",
  messagingSenderId: "215463930219",
  appId: "1:215463930219:web:785c81775c004111b0042e",
  measurementId: "G-115SLV40Y5"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { auth, db };
