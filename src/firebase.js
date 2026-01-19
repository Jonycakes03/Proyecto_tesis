import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyArL3nemH8SxzG4WylJoS_z43oUxxTWXQg",
    authDomain: "tesis-app-8030a.firebaseapp.com",
    projectId: "tesis-app-8030a",
    storageBucket: "tesis-app-8030a.firebasestorage.app",
    messagingSenderId: "375650987880",
    appId: "1:375650987880:web:50a20228c65453261e30dd",
    measurementId: "G-VJ62QBQ4ZK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
