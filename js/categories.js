/**
 * Categories Page JavaScript
 * عرض التصنيفات من Firebase حسب المتجر المحدد
 */

// استيراد دوال Firebase
import { 
    db,
    collection,
    getDocs,
    query,
    where
} from "./firebase-config.js";

// المتغيرات
let currentStore = null;
let currentStoreName = '';

document.addEventListener('DOMContentLoaded', function() {
    initCategoriesPage();
});

/**
 * تهيئة صفحة التصنيفات
 */
/**
 * تهيئة صفحة التصنيفات
 */
async function initCategoriesPage() {
    console.log('🚀 بدء تهيئة صفحة التصنيفات');
    
    // الحصول على المتجر من رابط URL
    currentStore = getStoreFromURL();
    console.log('🏪 المتجر المحدد:', currentStore);
    
    if (currentStore) {
        // إظهار مؤشر التحميل في المكان الصحيح
        showLoading(true);
        
        try {
            // تحميل التصنيفات من Firebase
            await loadCategoriesFromFirebase(currentStore);
        } catch (error) {
            console.error('❌ خطأ في تحميل التصنيفات:', error);
            showErrorMessage('حدث خطأ في تحميل التصنيفات');
        } finally {
            // إخفاء مؤشر التحميل بعد الانتهاء
            setTimeout(() => {
                showLoading(false);
            }, 500);
        }
    } else {
        // إظهار رسالة اختيار متجر
        showNoStoreMessage();
        // إخفاء مؤشر التحميل فوراً
        showLoading(false);
    }
    
    // إعداد الأحداث
    setupEvents();
    
    console.log('✅ Categories page initialized');
}
/**
 * الحصول على المتجر من رابط URL
 */
function getStoreFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('store');
}

/**
 * تحميل التصنيفات من Firebase
 */
async function loadCategoriesFromFirebase(store) {
    try {
        console.log(`📥 جاري تحميل التصنيفات للمتجر: ${store}`);
        
        // استعلام للحصول على التصنيفات الفريدة من المنتجات
        const productsQuery = query(
            collection(db, "products"),
            where("store", "==", store)
        );
        
        const snapshot = await getDocs(productsQuery);
        
        if (snapshot.empty) {
            console.log('📭 لا توجد منتجات لهذا المتجر');
            showNoCategoriesMessage();
            return;
        }
        
        // تجميع التصنيفات الفريدة مع عدد المنتجات
        const categoriesMap = new Map();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const categoryName = data.category;
            
            if (categoryName) {
                if (categoriesMap.has(categoryName)) {
                    // زيادة العدد إذا كان التصنيف موجود
                    const category = categoriesMap.get(categoryName);
                    category.count++;
                } else {
                    // إضافة تصنيف جديد
                    categoriesMap.set(categoryName, {
                        id: categoryName.replace(/\s+/g, '-').toLowerCase(),
                        name: categoryName,
                        count: 1,
                        // استخدام صورة أول منتج في هذا التصنيف كصورة للتصنيف
                        image: data.imageUrl || data.images?.[0] || 'https://via.placeholder.com/400x300?text=تصنيف'
                    });
                }
            }
        });
        
        // تحويل الخريطة إلى مصفوفة
        const categories = Array.from(categoriesMap.values());
        
        console.log(`✅ تم العثور على ${categories.length} تصنيف`);
        
        // عرض معلومات المتجر
        showStoreInfo(store, categories.length);
        
        // عرض التصنيفات
        displayCategories(categories, store);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل التصنيفات:', error);
        throw error;
    }
}

/**
 * إظهار معلومات المتجر
 */
async function showStoreInfo(store, categoriesCount) {
    // تحديد اسم المتجر - يتعامل مع الاسم الكامل والمختصر
    let storeName = '';
    
    if (store === 'متجر التقى' || store === 'tuka' || store.includes('التقى')) {
        storeName = 'التقى';
    } else if (store === 'samah' || store === 'متجر السماح' || store.includes('السماح')) {
        storeName = 'السماح';
    } else {
        storeName = store;
    }
    
    currentStoreName = storeName;
    
    // تحديث العنوان
    document.getElementById('storeTitle').textContent = `تصنيفات ${storeName}`;
    document.getElementById('storeSubtitle').textContent = `${categoriesCount} تصنيف متاح`;
    
    // تحديث شريط التصفح
    document.getElementById('storeBreadcrumb').innerHTML = `
        <a href="stores.html">المتاجر</a>
    `;
    document.getElementById('currentStoreName').textContent = storeName;
    document.getElementById('storeDivider').style.display = 'inline';
    
    // إظهار إجراءات المتجر
    document.getElementById('storeActions').style.display = 'flex';
    
    // تحديث زر عرض جميع المنتجات
    const viewAllBtn = document.getElementById('viewAllProductsBtn');
    if (viewAllBtn) {
        viewAllBtn.href = `products.html?store=${encodeURIComponent(store)}`;
    }
}

/**
 * عرض التصنيفات في الصفحة
 */
/**
 * عرض التصنيفات في الصفحة
 */
function displayCategories(categories, store) {
    console.log('📦 عرض التصنيفات:', categories);
    
    const container = document.getElementById('categoriesContainer');
    const noStoreMessage = document.getElementById('noStoreMessage');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    
    if (!container) {
        console.error('❌ عنصر categoriesContainer غير موجود');
        return;
    }
    
    // إخفاء جميع الرسائل أولاً
    if (noStoreMessage) noStoreMessage.style.display = 'none';
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';
    
    if (!categories || categories.length === 0) {
        console.log('📭 لا توجد تصنيفات للعرض');
        showNoCategoriesMessage();
        return;
    }
    
    // إنشاء HTML للتصنيفات
    let html = '';
    
    categories.forEach(category => {
        html += createCategoryCardHTML(category, store);
    });
    
    // وضع التصنيفات في الصفحة
    container.innerHTML = html;
    console.log('✅ تم عرض', categories.length, 'تصنيف');
    
    // إضافة تأثيرات الظهور
    setTimeout(() => {
        animateCategories();
    }, 100);
}

/**
 * إنشاء بطاقة تصنيف HTML
 */
function createCategoryCardHTML(category, store) {
    // تحديد الكلاس الخاص بالمتجر - يتعامل مع الاسم الكامل والمختصر
    let storeClass = '';
    let storeDisplayName = '';
    
    // التحقق من اسم المتجر (كل الحالات الممكنة)
    if (store === 'متجر التقى' || store === 'tuka' || store.includes('التقى')) {
        storeClass = 'tuka';
        storeDisplayName = 'التقى';
    } else if (store === 'samah' || store === 'متجر السماح' || store.includes('السماح')) {
        storeClass = 'samah';
        storeDisplayName = 'السماح';
    } else {
        storeClass = 'default';
        storeDisplayName = store; // اسم المتجر كما هو
    }
    
    return `
        <div class="category-card ${storeClass}" data-category="${category.id}">
            <div class="card-inner">
                <div class="card-front">
                    <div class="category-header">
                        <div class="header-pattern"></div>
                        <div class="category-icon-wrapper">
                            <i class="fas fa-tag"></i>
                        </div>
                        <div class="category-badge">
                            <span class="badge-count">${category.count}</span>
                            <span class="badge-text">منتج</span>
                        </div>
                    </div>
                    
                    <div class="category-body">
                        <h3 class="category-name">${category.name}</h3>
                        
                        <div class="category-stats">
                            <div class="stat-item">
                                <i class="fas fa-cubes"></i>
                                <span>${category.count} منتج متوفر</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-store"></i>
                                <span>${storeDisplayName}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="category-footer">
                        <a href="products.html?store=${encodeURIComponent(store)}&category=${encodeURIComponent(category.name)}" 
                           class="category-btn">
                            <span>استعرض المنتجات</span>
                            <i class="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * إظهار رسالة عدم وجود متجر
 */
function showNoStoreMessage() {
    const noStoreMessage = document.getElementById('noStoreMessage');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    
    if (noStoreMessage) noStoreMessage.style.display = 'block';
    if (categoriesContainer) categoriesContainer.innerHTML = '';
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';
    
    // إخفاء عنوان المتجر
    document.getElementById('storeTitle').textContent = 'التصنيفات';
    document.getElementById('storeSubtitle').textContent = 'اختر متجراً لعرض التصنيفات';
    document.getElementById('storeActions').style.display = 'none';
}

/**
 * إظهار رسالة عدم وجود تصنيفات
 */
function showNoCategoriesMessage() {
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const noStoreMessage = document.getElementById('noStoreMessage');
    
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'block';
    if (categoriesContainer) categoriesContainer.innerHTML = '';
    if (noStoreMessage) noStoreMessage.style.display = 'none';
}

/**
 * إظهار رسالة خطأ
 */
function showErrorMessage(message) {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h3>حدث خطأ</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">
                <i class="fas fa-redo"></i> إعادة المحاولة
            </button>
        </div>
    `;
}

/**
 * إظهار/إخفاء مؤشر التحميل
 */
/**
 * إظهار/إخفاء مؤشر التحميل
 */
function showLoading(show) {
    console.log('⏳ تغيير حالة التحميل:', show);
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const noStoreMessage = document.getElementById('noStoreMessage');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    
    if (loadingIndicator) {
        if (show) {
            // إظهار مؤشر التحميل في منتصف الصفحة
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.justifyContent = 'center';
            loadingIndicator.style.alignItems = 'center';
            loadingIndicator.style.minHeight = '300px';
            loadingIndicator.style.width = '100%';
            
            // إخفاء المحتوى الآخر
            if (categoriesContainer) categoriesContainer.style.display = 'none';
            if (noStoreMessage) noStoreMessage.style.display = 'none';
            if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';
        } else {
            // إخفاء مؤشر التحميل
            loadingIndicator.style.display = 'none';
            
            // إظهار حاوية التصنيفات
            if (categoriesContainer) {
                categoriesContainer.style.display = 'grid';
            }
        }
    }
}

/**
 * إضافة تأثيرات الظهور للتصنيفات
 */
function animateCategories() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * إعداد الأحداث
 */
function setupEvents() {
    // حدث لبطاقات التصنيفات
    setupCategoryCardsEvents();
    
    // حدث لتغيير المتجر
    setupStoreChangeEvent();
    
    // حدث لعرض جميع المنتجات
    setupViewAllProductsEvent();
}

/**
 * إعداد أحداث بطاقات التصنيفات
 */
function setupCategoryCardsEvents() {
    document.addEventListener('click', function(e) {
        const categoryCard = e.target.closest('.category-card');
        if (categoryCard) {
            categoryCard.style.transform = 'scale(0.98)';
            setTimeout(() => {
                categoryCard.style.transform = 'scale(1)';
            }, 150);
        }
    });
}

/**
 * إعداد حدث تغيير المتجر
 */
function setupStoreChangeEvent() {
    const changeStoreBtn = document.querySelector('[href="stores.html"]');
    if (changeStoreBtn) {
        changeStoreBtn.addEventListener('click', function(e) {
            if (currentStore) {
                e.preventDefault();
                showNotification('جاري الانتقال إلى المتاجر...', 'info');
                setTimeout(() => {
                    window.location.href = 'stores.html';
                }, 500);
            }
        });
    }
}

/**
 * إعداد حدث عرض جميع المنتجات
 */
function setupViewAllProductsEvent() {
    const viewAllBtn = document.getElementById('viewAllProductsBtn');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function(e) {
            if (currentStore) {
                e.preventDefault();
                showNotification(`جاري تحميل منتجات ${currentStoreName}...`, 'info');
                setTimeout(() => {
                    window.location.href = `products.html?store=${currentStore}`;
                }, 500);
            }
        });
    }
}

/**
 * إظهار إشعار للمستخدم
 */
function showNotification(message, type = 'info') {
    // التأكد من وجود عنصر الإشعارات
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'info' ? '#571c24' : '#28a745'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        margin-bottom: 10px;
        animation: slideDown 0.3s ease;
        direction: rtl;
        text-align: center;
        font-family: 'Cairo', sans-serif;
    `;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// إضافة animations للإشعارات
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(-100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);