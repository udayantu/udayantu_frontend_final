import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_zsC3GhCzR7m1yfmB0QGL7X-svEPGWzc",
  authDomain: "udayantu-7748d.firebaseapp.com",
  projectId: "udayantu-7748d",
  storageBucket: "udayantu-7748d.firebasestorage.app",
  messagingSenderId: "1025062155088",
  appId: "1:1025062155088:web:352b33acbd7a777f6ef255",
  measurementId: "G-72SX0Y89Y4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
