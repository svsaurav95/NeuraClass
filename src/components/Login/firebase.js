// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAgvITCHyhrhoB8ZpfRU2AcZJsM2M4phOs",
  authDomain: "technovate25-52639.firebaseapp.com",
  projectId: "technovate25-52639",
  storageBucket: "technovate25-52639.firebasestorage.app",
  messagingSenderId: "702283160809",
  appId: "1:702283160809:web:5e75d567a48d5e93dde478",
  measurementId: "G-1EX97ZR0M2"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

export { auth };
