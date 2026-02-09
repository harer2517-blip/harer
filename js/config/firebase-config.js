/**
 * Firebase Configuration for Harir Dashboard
 * ملف التهيئة المركزي لـ Firebase
 */

// إعدادات مشروع Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCMoFpEmsjbYPjYAl_LEX8GjC5so8kn9-Y",
    authDomain: "harir-92e27.firebaseapp.com",
    projectId: "harir-92e27",
    storageBucket: "harir-92e27.firebasestorage.app",
    messagingSenderId: "787234689138",
    appId: "1:787234689138:web:1d91758ff0d5c1fa9f72eb",
    measurementId: "G-T0JQMQQYZE"
};

// تهيئة Firebase إذا لم تكن مهيأة
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully from config file');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
}

// تصدير كائنات Firebase للاستخدام في الملفات الأخرى
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// تصدير للاستخدام العام
window.firebaseApp = firebase.app();
window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseStorage = storage;