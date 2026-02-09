/**
 * Settings Management Module
 */

class SettingsManager {
    constructor() {
        this.db = window.appState?.firebase?.db;
        this.settings = {};
    }

    /**
     * تحميل الإعدادات
     */
    async loadSettings() {
        try {
            if (!this.db) {
                console.warn('⚠️ Firebase غير متصل، استخدام إعدادات افتراضية');
                return this.getDefaultSettings();
            }

            const snapshot = await this.db.collection('settings').doc('main').get();
            
            if (snapshot.exists) {
                this.settings = snapshot.data();
            } else {
                this.settings = this.getDefaultSettings();
                // حفظ الإعدادات الافتراضية
                await this.saveSettings();
            }
            
            return this.settings;
        } catch (error) {
            console.error('❌ خطأ في تحميل الإعدادات:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * حفظ الإعدادات
     */
    async saveSettings() {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            await this.db.collection('settings').doc('main').set({
                ...this.settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: window.appState?.user?.uid
            }, { merge: true });

            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ الإعدادات:', error);
            throw error;
        }
    }

    /**
     * تحديث إعدادات معينة
     */
    async updateSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            return await this.saveSettings();
        } catch (error) {
            console.error('❌ خطأ في تحديث الإعدادات:', error);
            throw error;
        }
    }

    /**
     * الحصول على الإعدادات الافتراضية
     */
    getDefaultSettings() {
        return {
            general: {
                siteName: 'حرير',
                siteDescription: 'متجر جرابات وشالات فاخرة',
                currency: 'د.أ',
                timezone: 'Asia/Gaza',
                dateFormat: 'dd/MM/yyyy',
                language: 'ar'
            },
            store: {
                samahName: 'متجر السماح',
                tukaName: 'متجر التقى',
                contactEmail: 'info@harir.com',
                contactPhone: '0599123456',
                address: 'غزة - فلسطين'
            },
            notifications: {
                newOrders: true,
                lowStock: true,
                dailyReports: false,
                emailNotifications: true,
                pushNotifications: false
            },
            shipping: {
                enabled: true,
                shippingCost: 10.00,
                freeShippingThreshold: 100.00,
                estimatedDeliveryDays: 3
            },
            payment: {
                cashOnDelivery: true,
                bankTransfer: true,
                onlinePayment: false
            },
            theme: {
                primaryColor: '#571c24',
                secondaryColor: '#e9dfcd',
                accentColor: '#ff6b8b',
                darkMode: false
            }
        };
    }

    /**
     * توليد HTML لعرض الإعدادات
     */
    generateSettingsForm() {
        return `
            <div class="settings-form">
                <form id="settingsForm" onsubmit="saveAllSettings(event)">
                    
                    <!-- تبويبات الإعدادات -->
                    <ul class="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="general-tab" data-bs-toggle="tab" 
                                    data-bs-target="#general" type="button" role="tab">
                                <i class="fas fa-cog me-2"></i>عام
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="store-tab" data-bs-toggle="tab" 
                                    data-bs-target="#store" type="button" role="tab">
                                <i class="fas fa-store me-2"></i>المتجر
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="notifications-tab" data-bs-toggle="tab" 
                                    data-bs-target="#notifications" type="button" role="tab">
                                <i class="fas fa-bell me-2"></i>الإشعارات
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="shipping-tab" data-bs-toggle="tab" 
                                    data-bs-target="#shipping" type="button" role="tab">
                                <i class="fas fa-shipping-fast me-2"></i>الشحن
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="theme-tab" data-bs-toggle="tab" 
                                    data-bs-target="#theme" type="button" role="tab">
                                <i class="fas fa-palette me-2"></i>المظهر
                            </button>
                        </li>
                    </ul>
                    
                    <!-- محتوى التبويبات -->
                    <div class="tab-content" id="settingsTabsContent">
                        
                        <!-- تبويب الإعدادات العامة -->
                        <div class="tab-pane fade show active" id="general" role="tabpanel">
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="siteName">اسم الموقع</label>
                                    <input type="text" id="siteName" class="form-control" 
                                           value="${this.settings.general?.siteName || ''}">
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label for="currency">العملة</label>
                                    <select id="currency" class="form-control">
                                        <option value="د.أ" ${this.settings.general?.currency === 'د.أ' ? 'selected' : ''}>
                                            دينار أردني (د.أ)
                                        </option>
                                        <option value="$" ${this.settings.general?.currency === '$' ? 'selected' : ''}>
                                            دولار ($)
                                        </option>
                                        <option value="€" ${this.settings.general?.currency === '€' ? 'selected' : ''}>
                                            يورو (€)
                                        </option>
                                        <option value="ج.م" ${this.settings.general?.currency === 'ج.م' ? 'selected' : ''}>
                                            جنيه مصري (ج.م)
                                        </option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="siteDescription">وصف الموقع</label>
                                <textarea id="siteDescription" class="form-control" rows="2">${this.settings.general?.siteDescription || ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- تبويب إعدادات المتجر -->
                        <div class="tab-pane fade" id="store" role="tabpanel">
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="samahName">اسم متجر السماح</label>
                                    <input type="text" id="samahName" class="form-control" 
                                           value="${this.settings.store?.samahName || ''}">
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label for="tukaName">اسم متجر التقى</label>
                                    <input type="text" id="tukaName" class="form-control" 
                                           value="${this.settings.store?.tukaName || ''}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="contactEmail">البريد الإلكتروني للتواصل</label>
                                    <input type="email" id="contactEmail" class="form-control" 
                                           value="${this.settings.store?.contactEmail || ''}">
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label for="contactPhone">رقم الهاتف</label>
                                    <input type="text" id="contactPhone" class="form-control" 
                                           value="${this.settings.store?.contactPhone || ''}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="address">العنوان</label>
                                <input type="text" id="address" class="form-control" 
                                       value="${this.settings.store?.address || ''}">
                            </div>
                        </div>
                        
                        <!-- تبويب الإشعارات -->
                        <div class="tab-pane fade" id="notifications" role="tabpanel">
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="newOrders" 
                                       ${this.settings.notifications?.newOrders ? 'checked' : ''}>
                                <label class="form-check-label" for="newOrders">
                                    إشعارات الطلبات الجديدة
                                </label>
                            </div>
                            
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="lowStock" 
                                       ${this.settings.notifications?.lowStock ? 'checked' : ''}>
                                <label class="form-check-label" for="lowStock">
                                    تنبيهات نفاذ المخزون
                                </label>
                            </div>
                            
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="dailyReports" 
                                       ${this.settings.notifications?.dailyReports ? 'checked' : ''}>
                                <label class="form-check-label" for="dailyReports">
                                    التقارير اليومية
                                </label>
                            </div>
                            
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="emailNotifications" 
                                       ${this.settings.notifications?.emailNotifications ? 'checked' : ''}>
                                <label class="form-check-label" for="emailNotifications">
                                    الإشعارات عبر البريد الإلكتروني
                                </label>
                            </div>
                        </div>
                        
                        <!-- تبويب الشحن -->
                        <div class="tab-pane fade" id="shipping" role="tabpanel">
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="shippingEnabled" 
                                       ${this.settings.shipping?.enabled ? 'checked' : ''}>
                                <label class="form-check-label" for="shippingEnabled">
                                    تفعيل خدمة الشحن
                                </label>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group col-md-6">
                                    <label for="shippingCost">تكلفة الشحن (د.أ)</label>
                                    <input type="number" id="shippingCost" class="form-control" 
                                           step="0.01" min="0" 
                                           value="${this.settings.shipping?.shippingCost || 0}">
                                </div>
                                
                                <div class="form-group col-md-6">
                                    <label for="freeShippingThreshold">الحد الأدنى للشحن المجاني (د.أ)</label>
                                    <input type="number" id="freeShippingThreshold" class="form-control" 
                                           step="0.01" min="0" 
                                           value="${this.settings.shipping?.freeShippingThreshold || 0}">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="estimatedDeliveryDays">أيام التوصيل المتوقعة</label>
                                <input type="number" id="estimatedDeliveryDays" class="form-control" 
                                       min="1" max="30" 
                                       value="${this.settings.shipping?.estimatedDeliveryDays || 3}">
                            </div>
                        </div>
                        
                        <!-- تبويب المظهر -->
                        <div class="tab-pane fade" id="theme" role="tabpanel">
                            <div class="form-row">
                                <div class="form-group col-md-4">
                                    <label for="primaryColor">اللون الأساسي</label>
                                    <input type="color" id="primaryColor" class="form-control" 
                                           value="${this.settings.theme?.primaryColor || '#571c24'}">
                                </div>
                                
                                <div class="form-group col-md-4">
                                    <label for="secondaryColor">اللون الثانوي</label>
                                    <input type="color" id="secondaryColor" class="form-control" 
                                           value="${this.settings.theme?.secondaryColor || '#e9dfcd'}">
                                </div>
                                
                                <div class="form-group col-md-4">
                                    <label for="accentColor">لون التمييز</label>
                                    <input type="color" id="accentColor" class="form-control" 
                                           value="${this.settings.theme?.accentColor || '#ff6b8b'}">
                                </div>
                            </div>
                            
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="darkMode" 
                                       ${this.settings.theme?.darkMode ? 'checked' : ''}>
                                <label class="form-check-label" for="darkMode">
                                    الوضع الداكن
                                </label>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                سيتم تطبيق تغييرات المظهر بعد إعادة تحميل الصفحة.
                            </div>
                        </div>
                    </div>
                    
                    <!-- أزرار الحفظ -->
                    <div class="form-actions mt-4">
                        <button type="button" class="btn btn-outline" onclick="resetSettings()">
                            <i class="fas fa-undo"></i> إعادة تعيين
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * توليد HTML لإدارة الحساب
     */
    generateAccountSettings() {
        const user = window.appState?.user || {};
        
        return `
            <div class="account-settings">
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-user-cog me-2"></i>إعدادات الحساب</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div class="user-avatar-large text-center">
                                    <i class="fas fa-user-circle fa-5x text-muted"></i>
                                    <button class="btn btn-sm btn-outline mt-2">
                                        <i class="fas fa-camera"></i> تغيير الصورة
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-9">
                                <div class="form-group">
                                    <label for="userName">الاسم الكامل</label>
                                    <input type="text" id="userName" class="form-control" 
                                           value="${user.name || ''}">
                                </div>
                                
                                <div class="form-group">
                                    <label for="userEmail">البريد الإلكتروني</label>
                                    <input type="email" id="userEmail" class="form-control" 
                                           value="${user.email || ''}" readonly>
                                    <small class="text-muted">لا يمكن تغيير البريد الإلكتروني</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="userRole">الدور</label>
                            <input type="text" id="userRole" class="form-control" 
                                   value="${user.role || ''}" readonly>
                        </div>
                        
                        <button class="btn btn-primary" onclick="updateAccount()">
                            <i class="fas fa-save"></i> تحديث الحساب
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-lock me-2"></i>تغيير كلمة المرور</h5>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label for="currentPassword">كلمة المرور الحالية</label>
                            <input type="password" id="currentPassword" class="form-control">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="newPassword">كلمة المرور الجديدة</label>
                                <input type="password" id="newPassword" class="form-control">
                            </div>
                            
                            <div class="form-group col-md-6">
                                <label for="confirmPassword">تأكيد كلمة المرور الجديدة</label>
                                <input type="password" id="confirmPassword" class="form-control">
                            </div>
                        </div>
                        
                        <button class="btn btn-warning" onclick="changePassword()">
                            <i class="fas fa-key"></i> تغيير كلمة المرور
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// إنشاء نسخة من مدير الإعدادات
const settingsManager = new SettingsManager();

// دوال عامة للإعدادات
async function saveAllSettings(event) {
    event.preventDefault();
    
    try {
        const settings = {
            general: {
                siteName: document.getElementById('siteName').value,
                siteDescription: document.getElementById('siteDescription').value,
                currency: document.getElementById('currency').value
            },
            store: {
                samahName: document.getElementById('samahName').value,
                tukaName: document.getElementById('tukaName').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactPhone: document.getElementById('contactPhone').value,
                address: document.getElementById('address').value
            },
            notifications: {
                newOrders: document.getElementById('newOrders').checked,
                lowStock: document.getElementById('lowStock').checked,
                dailyReports: document.getElementById('dailyReports').checked,
                emailNotifications: document.getElementById('emailNotifications').checked
            },
            shipping: {
                enabled: document.getElementById('shippingEnabled').checked,
                shippingCost: parseFloat(document.getElementById('shippingCost').value),
                freeShippingThreshold: parseFloat(document.getElementById('freeShippingThreshold').value),
                estimatedDeliveryDays: parseInt(document.getElementById('estimatedDeliveryDays').value)
            },
            theme: {
                primaryColor: document.getElementById('primaryColor').value,
                secondaryColor: document.getElementById('secondaryColor').value,
                accentColor: document.getElementById('accentColor').value,
                darkMode: document.getElementById('darkMode').checked
            }
        };
        
        await settingsManager.updateSettings(settings);
        alert('✅ تم حفظ الإعدادات بنجاح');
        
        // تطبيق تغييرات المظهر
        applyThemeSettings(settings.theme);
        
    } catch (error) {
        alert('❌ فشل حفظ الإعدادات: ' + error.message);
    }
}

function resetSettings() {
    if (confirm('هل تريد إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
        settingsManager.settings = settingsManager.getDefaultSettings();
        // إعادة تحميل نموذج الإعدادات
        loadPageContent('settings');
        alert('تم إعادة تعيين الإعدادات');
    }
}

function applyThemeSettings(theme) {
    // تطبيق ألوان المظهر
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    
    // تطبيق الوضع الداكن
    if (theme.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

async function updateAccount() {
    const userName = document.getElementById('userName')?.value;
    if (!userName) {
        alert('يرجى إدخال الاسم');
        return;
    }
    
    try {
        // في الإصدار الحالي، نحدث localStorage فقط
        localStorage.setItem('harir_user_name', userName);
        window.appState.user.name = userName;
        
        // تحديث واجهة المستخدم
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = userName;
        
        alert('✅ تم تحديث معلومات الحساب');
    } catch (error) {
        alert('❌ فشل تحديث الحساب: ' + error.message);
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('يرجى تعبئة جميع الحقول');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }
    
    try {
        // في الإصدار الحالي، نحدث localStorage فقط
        localStorage.setItem('harir_user_password', newPassword);
        
        // في المستقبل، نحدث كلمة المرور في Firebase
        if (window.appState.firebase.auth) {
            const user = window.appState.firebase.auth.currentUser;
            if (user) {
                await user.updatePassword(newPassword);
            }
        }
        
        // مسح حقول كلمة المرور
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        alert('✅ تم تغيير كلمة المرور بنجاح');
    } catch (error) {
        console.error('❌ خطأ في تغيير كلمة المرور:', error);
        alert('❌ فشل تغيير كلمة المرور: ' + error.message);
    }
}

// تصدير الدوال للاستخدام العام
window.settingsManager = settingsManager;
window.saveAllSettings = saveAllSettings;
window.resetSettings = resetSettings;
window.updateAccount = updateAccount;
window.changePassword = changePassword;