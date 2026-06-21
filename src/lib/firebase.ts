// Firebase web app — client-side SDK.
//
// These values are the public Firebase web config (safe to ship to the browser;
// access is enforced by Firebase security rules, not by hiding this key). Used
// here only for Analytics — the app's own auth/data run on the Next.js server.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC0vTez4WPws-eNZW62UpSu__ubj70zFak",
  authDomain: "scadxctf-7271a.firebaseapp.com",
  projectId: "scadxctf-7271a",
  storageBucket: "scadxctf-7271a.firebasestorage.app",
  messagingSenderId: "645653631554",
  appId: "1:645653631554:web:1e5e83edbacc1c6e0fd3db",
  measurementId: "G-85LRCHR0R1",
};

// Reuse the app across hot-reloads / re-imports instead of re-initializing.
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);
