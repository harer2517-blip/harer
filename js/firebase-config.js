// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// تكوين Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCMoFpEmsjbYPjYAl_LEX8GjC5so8kn9-Y",
    authDomain: "harir-92e27.firebaseapp.com",
    projectId: "harir-92e27",
    storageBucket: "harir-92e27.firebasestorage.app",
    messagingSenderId: "787234689138",
    appId: "1:787234689138:web:1d91758ff0d5c1fa9f72eb",
    measurementId: "G-T0JQMQQYZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// تصدير جميع الدوال اللازمة
export {
    db,
    collection,
    getDocs,
    query,
    where,
    orderBy
};