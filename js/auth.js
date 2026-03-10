/**
 * نظام المصادقة - التسجيل والدخول للإدارة
 */

// تهيئة Firebase
let auth = null;
let db = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 تحميل نظام المصادقة...');
    
    // تحقق من تحميل Firebase
    if (typeof firebase === 'undefined') {
        showError('Firebase غير محمل. تحقق من اتصال الإنترنت.');
        return;
    }
    
    try {
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
        
        // تهيئة Firebase مرة واحدة فقط
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        auth = firebase.auth();
        db = firebase.firestore();
        
        console.log('✅ Firebase Auth مهيأ');
        initAuth();
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error);
        showError('تعذر تهيئة نظام المصادقة');
    }
});

function initAuth() {
    // إعداد الأحداث
    setupEventListeners();
    
    // التحقق من حالة تسجيل الدخول
    checkAuthState();
    
    // إعداد تبديل إظهار/إخفاء كلمة المرور
    setupPasswordToggle();
    
    console.log('🚀 نظام المصادقة جاهز');
}

// التحقق من حالة تسجيل الدخول
function checkAuthState() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // المستخدم مسجل الدخول
            console.log('👤 مستخدم مسجل:', user.email);
            
            // التحقق من صلاحيات المشرف
            checkAdminRole(user.uid).then(isAdmin => {
                if (isAdmin) {
                    // توجيه إلى لوحة التحكم
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    // ليس مشرفاً
                    showMessage('ليس لديك صلاحية الوصول كمسؤول', 'danger');
                    auth.signOut();
                }
            });
        } else {
            // المستخدم غير مسجل
            console.log('👤 لا يوجد مستخدم مسجل');
        }
    });
}

// التحقق من صلاحيات المشرف
async function checkAdminRole(userId) {
    try {
        const userDoc = await db.collection('admins').doc(userId).get();
        return userDoc.exists && userDoc.data().role === 'admin';
    } catch (error) {
        console.error('❌ خطأ في التحقق من الصلاحيات:', error);
        return false;
    }
}

// إعداد الأحداث
function setupEventListeners() {
    // تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // التسجيل
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // إعادة تعيين كلمة المرور
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
    
    // تبديل بين النماذج
    document.getElementById('showRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        showRegister();
    });
    
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });
    
    document.getElementById('showLoginFromForgot')?.addEventListener('click', function(e) {
        e.preventDefault();
        showLogin();
    });
    
    document.getElementById('forgotPassword')?.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotPassword();
    });
}

// تسجيل الدخول
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // التحقق من البيانات
    if (!email || !password) {
        showMessage('يرجى ملء جميع الحقول', 'danger', 'loginMessage');
        return;
    }
    
    // عرض التحميل
    setLoading('login', true);
    
    try {
        // تعيين استمرارية الجلسة
        if (rememberMe) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }
        
        // تسجيل الدخول
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // التحقق من تأكيد البريد
        if (!userCredential.user.emailVerified) {
            showMessage('يرجى تأكيد بريدك الإلكتروني أولاً', 'warning', 'loginMessage');
            await auth.signOut();
            return;
        }
        
        // التحقق من صلاحيات المشرف
        const isAdmin = await checkAdminRole(userCredential.user.uid);
        
        if (!isAdmin) {
            showMessage('ليس لديك صلاحية الوصول كمسؤول', 'danger', 'loginMessage');
            await auth.signOut();
            return;
        }
        
        // تسجيل الدخول ناجح
        showMessage('تم تسجيل الدخول بنجاح! جاري التوجيه...', 'success', 'loginMessage');
        
        // حفظ بيانات الجلسة
        localStorage.setItem('harir_admin_logged_in', 'true');
        localStorage.setItem('harir_admin_email', email);
        
    } catch (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        
        let errorMessage = 'حدث خطأ في تسجيل الدخول';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني غير مسجل';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'بريد إلكتروني غير صالح';
                break;
            case 'auth/user-disabled':
                errorMessage = 'هذا الحساب معطل';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'محاولات كثيرة جداً، حاول لاحقاً';
                break;
        }
        
        showMessage(errorMessage, 'danger', 'loginMessage');
        
    } finally {
        setLoading('login', false);
    }
}

// التسجيل
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // التحقق من البيانات
    if (!name || !email || !password || !confirmPassword) {
        showMessage('يرجى ملء جميع الحقول', 'danger', 'registerMessage');
        return;
    }
    
    if (password.length < 6) {
        showMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'danger', 'registerMessage');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('كلمات المرور غير متطابقة', 'danger', 'registerMessage');
        return;
    }
    
    // عرض التحميل
    setLoading('register', true);
    
    try {
        // إنشاء حساب
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // تحديث اسم المستخدم
        await user.updateProfile({
            displayName: name
        });
        
        // إرسال بريد تأكيد
        await user.sendEmailVerification();
        
        // إنشاء وثيقة المشرف في Firestore
        await db.collection('admins').doc(user.uid).set({
            uid: user.uid,
            email: email,
            name: name,
            role: 'admin',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            isActive: true,
            lastLogin: null
        });
        
        // تسجيل الخروج مؤقتاً حتى يؤكد البريد
        await auth.signOut();
        
        showMessage(
            `تم إنشاء الحساب بنجاح! تم إرسال رابط التأكيد إلى ${email}. يرجى تأكيد بريدك ثم تسجيل الدخول.`,
            'success',
            'registerMessage'
        );
        
        // الانتقال إلى تسجيل الدخول بعد 3 ثواني
        setTimeout(() => {
            showLogin();
        }, 3000);
        
    } catch (error) {
        console.error('❌ خطأ في التسجيل:', error);
        
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                break;
            case 'auth/invalid-email':
                errorMessage = 'بريد إلكتروني غير صالح';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة جداً';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'عملية التسجيل غير مسموحة حالياً';
                break;
        }
        
        showMessage(errorMessage, 'danger', 'registerMessage');
        
    } finally {
        setLoading('register', false);
    }
}

// إعادة تعيين كلمة المرور
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    if (!email) {
        showMessage('يرجى إدخال البريد الإلكتروني', 'danger', 'forgotMessage');
        return;
    }
    
    // عرض التحميل
    setLoading('forgot', true);
    
    try {
        await auth.sendPasswordResetEmail(email);
        
        showMessage(
            `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}. يرجى التحقق من بريدك.`,
            'success',
            'forgotMessage'
        );
        
        // مسح الحقل
        document.getElementById('forgotEmail').value = '';
        
    } catch (error) {
        console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error);
        
        let errorMessage = 'حدث خطأ في إرسال رابط التعيين';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'البريد الإلكتروني غير مسجل';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'بريد إلكتروني غير صالح';
        }
        
        showMessage(errorMessage, 'danger', 'forgotMessage');
        
    } finally {
        setLoading('forgot', false);
    }
}

// إظهار/إخفاء كلمة المرور
function setupPasswordToggle() {
    // تسجيل الدخول
    const toggleLogin = document.getElementById('toggleLoginPassword');
    if (toggleLogin) {
        toggleLogin.addEventListener('click', function() {
            const passwordInput = document.getElementById('loginPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
    
    // التسجيل
    const toggleRegister = document.getElementById('toggleRegisterPassword');
    if (toggleRegister) {
        toggleRegister.addEventListener('click', function() {
            const passwordInput = document.getElementById('registerPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
}

// عرض النماذج
function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('forgotSection').style.display = 'none';
    
    // مسح الرسائل
    clearMessages();
}

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('forgotSection').style.display = 'none';
    
    // مسح الرسائل
    clearMessages();
}

function showForgotPassword() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('forgotSection').style.display = 'block';
    
    // مسح الرسائل
    clearMessages();
}

// عرض الرسائل
function showMessage(message, type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    container.style.display = 'block';
    
    // إخفاء الرسالة بعد 5 ثواني
    if (type !== 'danger') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

function clearMessages() {
    ['loginMessage', 'registerMessage', 'forgotMessage'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    });
}

// تعيين حالة التحميل
function setLoading(action, isLoading) {
    const textElements = {
        login: document.getElementById('loginText'),
        register: document.getElementById('registerText'),
        forgot: document.getElementById('forgotText')
    };
    
    const loadingElements = {
        login: document.getElementById('loginLoading'),
        register: document.getElementById('registerLoading'),
        forgot: document.getElementById('forgotLoading')
    };
    
    const buttonElements = {
        login: document.getElementById('loginBtn'),
        register: document.getElementById('registerBtn'),
        forgot: document.getElementById('forgotBtn')
    };
    
    if (textElements[action]) {
        textElements[action].style.display = isLoading ? 'none' : 'inline';
    }
    
    if (loadingElements[action]) {
        loadingElements[action].style.display = isLoading ? 'inline' : 'none';
    }
    
    if (buttonElements[action]) {
        buttonElements[action].disabled = isLoading;
    }
}

// عرض خطأ عام
function showError(message) {
    document.body.innerHTML = `
        <div class="container text-center py-5">
            <div class="alert alert-danger" style="max-width: 500px; margin: 0 auto;">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h2>خطأ في التحميل</h2>
                <p class="mb-4">${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> إعادة تحميل الصفحة
                </button>
            </div>
        </div>
    `;
}

// أدوات التصحيح
window.authDebug = {
    getCurrentUser: () => auth?.currentUser,
    signOut: () => auth?.signOut(),
    createTestAdmin: async () => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(
                'admin@harir.com',
                'admin123'
            );
            
            await db.collection('admins').doc(userCredential.user.uid).set({
                uid: userCredential.user.uid,
                email: 'admin@harir.com',
                name: 'المشرف الرئيسي',
                role: 'admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            });
            
            console.log('✅ تم إنشاء مشرف تجريبي');
            return userCredential.user;
        } catch (error) {
            console.error('❌ خطأ:', error);
        }
    }
};

console.log('🔐 نظام المصادقة جاهز للتشغيل');