import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRfOLJKZNkGdMrgXNFFCgybGpDS--kl5g",
  authDomain: "groundgame26.firebaseapp.com",
  databaseURL: "https://groundgame26-default-rtdb.firebaseio.com",
  projectId: "groundgame26",
  storageBucket: "groundgame26.firebasestorage.app",
  messagingSenderId: "707878592124",
  appId: "1:707878592124:web:8566758659b79e519773f9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
