/* ===================================================
   auth.js — Shared Auth Logic
   =================================================== */

import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

/* ── Create user profile in Firestore ─────────────── */
async function createUserProfile(user, role = "student", extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || extra.name || "",
      role,          // "student" | "teacher" | "admin"
      school: extra.school || "",
      createdAt: serverTimestamp()
    });
  }
}

/* ── Sign Up with Email ────────────────────────────── */
export async function signUpWithEmail({ name, email, password, school, remember }) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  await createUserProfile(cred.user, "student", { name, school });
  return cred.user;
}

/* ── Sign In with Email ────────────────────────────── */
export async function signInWithEmail({ email, password, remember }) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/* ── Sign In with Google ──────────────────────────── */
export async function signInWithGoogle(remember = true) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserProfile(cred.user, "student");
  return cred.user;
}

/* ── Forgot Password ──────────────────────────────── */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/* ── Sign Out ─────────────────────────────────────── */
export async function logOut() {
  await signOut(auth);
  window.location.href = "index.html";
}

/* ── Get current user role from Firestore ─────────── */
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().role : null;
}

/* ── Auth state observer (used by nav.js) ─────────── */
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
