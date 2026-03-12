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
async function initCategoriesPage() {
    // الحصول على المتجر من رابط URL
    currentStore = getStoreFromURL();

    if (currentStore) {
        // تحديث معلومات المتجر الأساسية
        updateStoreInfo(currentStore);
        
        // عرض هيكل البطاقات (Skeleton) فوراً
        showSkeletonCategories();
        
        // تحميل التصنيفات في الخلفية
        try {
            await loadCategoriesFromFirebase(currentStore);
        } catch (error) {
            console.error('خطأ في تحميل التصنيفات:', error);
            showErrorMessage('حدث خطأ في تحميل التصنيفات');
        }
    } else {
        // إذا لم يتم تحديد متجر، أظهر رسالة مناسبة
        showNoStoreMessage();
    }
}

/**
 * الحصول على المتجر من رابط URL
 */
function getStoreFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('store');
}

/**
 * تحديث معلومات المتجر في واجهة المستخدم
 */
function updateStoreInfo(store) {
    // تنظيف اسم المتجر للعرض
    if (store === 'متجر التقى' || store.includes('التقى')) {
        currentStoreName = 'التقى';
    } else if (store === 'متجر السماح' || store.includes('السماح')) {
        currentStoreName = 'السماح';
    } else {
        currentStoreName = store;
    }

    // تحديث العناوين
    const storeTitleEl = document.getElementById('storeTitle');
    const storeSubtitleEl = document.getElementById('storeSubtitle');
    const storeBreadcrumbEl = document.getElementById('storeBreadcrumb');
    const currentStoreNameEl = document.getElementById('currentStoreName');
    const storeDividerEl = document.getElementById('storeDivider');
    const storeActionsEl = document.getElementById('storeActions');
    const viewAllBtn = document.getElementById('viewAllProductsBtn');

    if (storeTitleEl) storeTitleEl.textContent = `تصنيفات ${currentStoreName}`;
    if (storeSubtitleEl) storeSubtitleEl.textContent = `جاري تحميل التصنيفات...`;
    if (storeBreadcrumbEl) storeBreadcrumbEl.innerHTML = `<a href="stores.html">المتاجر</a>`;
    if (currentStoreNameEl) currentStoreNameEl.textContent = currentStoreName;
    if (storeDividerEl) storeDividerEl.style.display = 'inline';
    if (storeActionsEl) storeActionsEl.style.display = 'flex';
    if (viewAllBtn) viewAllBtn.href = `products.html?store=${encodeURIComponent(store)}`;
}

/**
 * عرض هيكل البطاقات (Skeleton Loading)
 */
function showSkeletonCategories() {
    const container = document.getElementById('categoriesContainer');
    const noStoreMessage = document.getElementById('noStoreMessage');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    
    if (!container) return;
    
    // إخفاء الرسائل
    if (noStoreMessage) noStoreMessage.style.display = 'none';
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';
    
    // إظهار الحاوية
    container.style.display = 'grid';
    
    // إنشاء 6 بطاقات هيكل (skeleton)
    let skeletonHTML = '';
    for (let i = 0; i < 6; i++) {
        skeletonHTML += `
            <div class="category-card skeleton-card">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="category-header skeleton">
                            <div class="category-icon-wrapper skeleton-icon"></div>
                            <div class="category-badge skeleton-badge"></div>
                        </div>
                        <div class="category-body">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-stats">
                                <div class="skeleton-stat-item"></div>
                            </div>
                        </div>
                        <div class="category-footer">
                            <div class="skeleton-btn"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = skeletonHTML;
}

/**
 * تحميل التصنيفات من Firebase
 */
async function loadCategoriesFromFirebase(store) {
    // استعلام للحصول على التصنيفات الفريدة من المنتجات
    const productsQuery = query(
        collection(db, "products"),
        where("store", "==", store)
    );

    const snapshot = await getDocs(productsQuery);

    if (snapshot.empty) {
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
                const category = categoriesMap.get(categoryName);
                category.count++;
            } else {
                categoriesMap.set(categoryName, {
                    id: categoryName.replace(/\s+/g, '-').toLowerCase(),
                    name: categoryName,
                    count: 1,
                    image: data.imageUrl || data.images?.[0] || 'https://via.placeholder.com/400x300?text=تصنيف'
                });
            }
        }
    });

    // تحويل الخريطة إلى مصفوفة
    const categories = Array.from(categoriesMap.values());
    
    // ترتيب التصنيفات - وضع "شالات" في المقدمة
    const sortedCategories = sortCategoriesWithShalatsFirst(categories);
    
    // تحديث العنوان بعدد التصنيفات
    const storeSubtitleEl = document.getElementById('storeSubtitle');
    if (storeSubtitleEl) {
        storeSubtitleEl.textContent = `${categories.length} تصنيف متاح`;
    }

    // عرض التصنيفات الحقيقية (تحل محل skeleton)
    displayCategories(sortedCategories, store);
}

/**
 * ترتيب التصنيفات بحيث أي تصنيف يحتوي على كلمة "شالات" يكون في المقدمة
 */
function sortCategoriesWithShalatsFirst(categories) {
    // نسخة من المصفوفة حتى لا نغير الأصل
    const categoriesCopy = [...categories];
    
    // ترتيب التصنيفات:
    // 1. التصنيفات التي تحتوي على "شالات" أولاً
    // 2. ثم باقي التصنيفات حسب الترتيب الأبجدي
    return categoriesCopy.sort((a, b) => {
        const aHasShalat = a.name.includes('شالات');
        const bHasShalat = b.name.includes('شالات');
        
        // إذا كان A يحتوي على "شالات" و B لا يحتوي، A يأتي أولاً
        if (aHasShalat && !bHasShalat) return -1;
        
        // إذا كان B يحتوي على "شالات" و A لا يحتوي، B يأتي أولاً
        if (!aHasShalat && bHasShalat) return 1;
        
        // إذا كان كلاهما يحتوي على "شالات" أو كلاهما لا يحتوي، رتب حسب الترتيب الأبجدي
        return a.name.localeCompare(b.name, 'ar');
    });
}

/**
 * عرض التصنيفات في الصفحة
 */
function displayCategories(categories, store) {
    const container = document.getElementById('categoriesContainer');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');

    if (!container) return;

    if (!categories || categories.length === 0) {
        showNoCategoriesMessage();
        return;
    }

    // إخفاء رسالة لا توجد تصنيفات
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';

    // إنشاء HTML للتصنيفات
    let html = '';
    
    // استخدام requestAnimationFrame لتقسيم التحميل على عدة إطارات
    // هذا يمنع تجميد الصفحة عند عرض عدد كبير من التصنيفات
    const renderChunk = (startIndex) => {
        const chunkSize = 2; // عرض تصنيفين كل مرة
        const endIndex = Math.min(startIndex + chunkSize, categories.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            html += createCategoryCardHTML(categories[i], store);
        }
        
        if (endIndex <= categories.length) {
            // تحديث الـ DOM بالجزء الجديد
            container.innerHTML = html;
            
            // إذا بقي المزيد، استمر بعد إطار واحد
            if (endIndex < categories.length) {
                requestAnimationFrame(() => {
                    renderChunk(endIndex);
                });
            }
        }
    };
    
    // بدء التحميل التدريجي من الفهرس 0
    renderChunk(0);
}

/**
 * إنشاء بطاقة تصنيف HTML
 */
function createCategoryCardHTML(category, store) {
    return `
        <a href="products.html?store=${encodeURIComponent(store)}&category=${encodeURIComponent(category.name)}" 
           class="category-card" 
           data-category="${category.id}"
           style="text-decoration: none; color: inherit;">
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
                        </div>
                    </div>

                    <div class="category-footer">
                        <span class="category-btn">
                            <span>استعرض المنتجات</span>
                            <i class="fas fa-arrow-left"></i>
                        </span>
                    </div>
                </div>
            </div>
        </a>
    `;
}

/**
 * إظهار رسالة عدم وجود متجر
 */
function showNoStoreMessage() {
    const noStoreMessage = document.getElementById('noStoreMessage');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    const storeTitleEl = document.getElementById('storeTitle');
    const storeSubtitleEl = document.getElementById('storeSubtitle');
    const storeActionsEl = document.getElementById('storeActions');

    if (noStoreMessage) noStoreMessage.style.display = 'block';
    if (categoriesContainer) categoriesContainer.innerHTML = '';
    if (noCategoriesMessage) noCategoriesMessage.style.display = 'none';
    if (storeTitleEl) storeTitleEl.textContent = 'التصنيفات';
    if (storeSubtitleEl) storeSubtitleEl.textContent = 'اختر متجراً لعرض التصنيفات';
    if (storeActionsEl) storeActionsEl.style.display = 'none';
}

/**
 * إظهار رسالة عدم وجود تصنيفات
 */
function showNoCategoriesMessage() {
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    const categoriesContainer = document.getElementById('categoriesContainer');
    const noStoreMessage = document.getElementById('noStoreMessage');
    const storeSubtitleEl = document.getElementById('storeSubtitle');

    if (noCategoriesMessage) noCategoriesMessage.style.display = 'block';
    if (categoriesContainer) categoriesContainer.innerHTML = '';
    if (noStoreMessage) noStoreMessage.style.display = 'none';
    if (storeSubtitleEl) storeSubtitleEl.textContent = `لا توجد تصنيفات لهذا المتجر`;
}

/**
 * إظهار رسالة خطأ
 */
function showErrorMessage(message) {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-exclamation-circle" style="font-size: 50px; color: #dc3545; margin-bottom: 20px;"></i>
            <h3>حدث خطأ</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> إعادة المحاولة
            </button>
        </div>
    `;
}

// تصدير الدوال إذا احتجتها في مكان آخر
export {
    sortCategoriesWithShalatsFirst
};