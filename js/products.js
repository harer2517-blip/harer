/**
 * صفحة المنتجات الرئيسية - بدون ES6 Modules
 */

// تهيئة المتغيرات
let allProducts = [];
let db = null;

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 الصفحة حمّلت');
    
    // الانتظار قليلاً لتحميل Firebase
    setTimeout(initApp, 1000);
});

function initApp() {
    console.log('🚀 بدء التطبيق...');
    
    // تحقق من وجود Firebase
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase غير محمل!');
        showFirebaseError();
        return;
    }
    
    console.log('✅ Firebase محمل:', firebase.SDK_VERSION);
    
    try {
        // تهيئة Firebase
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: "AIzaSyCMoFpEmsjbYPjYAl_LEX8GjC5so8kn9-Y",
                authDomain: "harir-92e27.firebaseapp.com",
                projectId: "harir-92e27",
                storageBucket: "harir-92e27.firebasestorage.app",
                messagingSenderId: "787234689138",
                appId: "1:787234689138:web:1d91758ff0d5c1fa9f72eb",
                measurementId: "G-T0JQMQQYZE"
            };
            
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase مهيأ');
        }
        
        // الحصول على Firestore
        db = firebase.firestore();
        
        // بدء التطبيق
        startApp();
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error);
        showErrorMessage('خطأ في تهيئة قاعدة البيانات');
    }
}

function showFirebaseError() {
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <h3>خطأ في التحميل</h3>
                    <p class="mb-3">لم يتم تحميل Firebase SDK بشكل صحيح.</p>
                    <p class="mb-3">قد يكون السبب:</p>
                    <ul class="text-start">
                        <li>عدم اتصال بالإنترنت</li>
                        <li>مشكلة في CDN</li>
                        <li>حاجب إعلانات يحجب Firebase</li>
                    </ul>
                    <button onclick="location.reload()" class="btn btn-primary mt-3">
                        <i class="fas fa-redo"></i> إعادة تحميل الصفحة
                    </button>
                </div>
            </div>
        `;
    }
    
    hidePageLoader();
}

function startApp() {
    try {
        // إخفاء صفحة التحميل
        hidePageLoader();
        
        // الحصول على معاملات URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentStore = urlParams.get('store') || '';
        const currentCategory = urlParams.get('category') || '';
        
        console.log('🔍 معاملات URL:', { 
            store: currentStore, 
            category: currentCategory 
        });
        
        // إعداد واجهة المستخدم
        setupUI();
        
        // تحميل المنتجات
        loadProducts(currentStore, currentCategory);
        
        // إعداد الأحداث
        setupEventListeners();
        
        console.log('✅ التطبيق يعمل بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في بدء التطبيق:', error);
        showErrorMessage(error.message || 'حدث خطأ غير متوقع');
    }
}

function hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(function() {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }, 300);
    }
}

function setupUI() {
    updateCartUI();
    updateProductsCount(0);
}

async function loadProducts(storeFilter, categoryFilter) {
    try {
        showLoading(true);
        
        console.log('📥 جاري تحميل المنتجات...');
        
        if (!db) {
            throw new Error('قاعدة البيانات غير متاحة');
        }
        
        // محاولة مع timeout
        const loadPromise = db.collection('products').get();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: Firestore لم يستجب')), 10000);
        });
        
        let snapshot;
        try {
            snapshot = await Promise.race([loadPromise, timeoutPromise]);
            console.log('✅ اتصال Firestore ناجح');
        } catch (timeoutError) {
            console.warn('⚠️ Firestore لم يستجب، استخدام البيانات المحلية');
            return loadLocalProducts(storeFilter, categoryFilter);
        }
        
        if (snapshot.empty) {
            console.log('📭 لا توجد منتجات في قاعدة البيانات');
            showNoProductsMessage();
            return;
        }
        
        allProducts = [];
        snapshot.forEach(function(doc) {
            const data = doc.data();
            allProducts.push(formatProductData(data, doc.id));
        });
        
        console.log(`📊 تم تحميل ${allProducts.length} منتج من Firebase`);
        
        // تطبيق الفلاتر محلياً
        applyFiltersLocally(storeFilter, categoryFilter);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        
        if (error.message.includes('offline') || error.message.includes('Timeout')) {
            console.log('🔄 استخدام البيانات المحلية كبديل');
            loadLocalProducts(storeFilter, categoryFilter);
        } else {
            showErrorMessage('تعذر تحميل المنتجات: ' + error.message);
        }
    } finally {
        showLoading(false);
    }
}

// دالة للبيانات المحلية
function loadLocalProducts(storeFilter, categoryFilter) {
    console.log('💾 استخدام البيانات المحلية المخزنة');
    
    // محاولة جلب البيانات من localStorage أولاً
    try {
        const savedProducts = localStorage.getItem('harir_products_cache');
        if (savedProducts) {
            allProducts = JSON.parse(savedProducts);
            console.log(`📂 تم تحميل ${allProducts.length} منتج من الذاكرة المحلية`);
            applyFiltersLocally(storeFilter, categoryFilter);
            return;
        }
    } catch (e) {
        console.warn('⚠️ تعذر تحميل البيانات المحلية');
    }
    
    // بيانات وهمية للعرض
    allProducts = getMockProducts();
    console.log(`🎭 استخدام ${allProducts.length} منتج وهمي للعرض`);
    applyFiltersLocally(storeFilter, categoryFilter);
}

function applyFiltersLocally(storeFilter, categoryFilter) {
    let filteredProducts = [...allProducts];
    
    if (storeFilter && storeFilter.trim() !== '') {
        filteredProducts = filteredProducts.filter(function(product) {
            return product.store === storeFilter.trim();
        });
        console.log(`🔍 فلترة حسب المتجر "${storeFilter}": ${filteredProducts.length} منتج`);
    }
    
    if (categoryFilter && categoryFilter.trim() !== '') {
        filteredProducts = filteredProducts.filter(function(product) {
            return product.category === categoryFilter.trim();
        });
        console.log(`🔍 فلترة حسب التصنيف "${categoryFilter}": ${filteredProducts.length} منتج`);
    }
    
    // ترتيب حسب التاريخ
    filteredProducts.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    console.log(`✅ ${filteredProducts.length} منتج للعرض`);
    displayProducts(filteredProducts);
    
    // حفظ في الذاكرة المحلية
    if (allProducts.length > 0) {
        try {
            localStorage.setItem('harir_products_cache', JSON.stringify(allProducts));
            localStorage.setItem('harir_products_cache_time', new Date().toISOString());
        } catch (e) {
            console.warn('⚠️ تعذر حفظ البيانات محلياً');
        }
    }
}

function getMockProducts() {
    return [
        {
            id: '1',
            name: 'شالات حرير فاخرة',
            description: 'شالات أنيقة من الحرير الطبيعي الفاخر',
            price: 149.99,
            discount: 10,
            imageUrl: 'https://via.placeholder.com/400x300?text=حرير+فاخر',
            store: 'tuka',
            category: 'tuka_silk',
            stock: 15,
            isNew: true,
            isFeatured: true,
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            id: '2',
            name: 'جرابات حرير مميزة',
            description: 'جرابات عالية الجودة من الحرير الخالص',
            price: 99.99,
            discount: 0,
            imageUrl: 'https://via.placeholder.com/400x300?text=جرابات+حرير',
            store: 'tuka',
            category: 'tuka_silk',
            stock: 8,
            isNew: false,
            isFeatured: true,
            createdAt: '2024-01-10T14:20:00Z'
        },
        {
            id: '3',
            name: 'حجاب سريع من الحرير',
            description: 'حجاب سريع ومريح للمرأة العصرية',
            price: 79.99,
            discount: 15,
            imageUrl: 'https://via.placeholder.com/400x300?text=حجاب+سريع',
            store: 'samah',
            category: 'hijab_instant',
            stock: 25,
            isNew: true,
            isFeatured: false,
            createdAt: '2024-01-20T09:15:00Z'
        },
        {
            id: '4',
            name: 'طقم صلاة حريري',
            description: 'طقم صلاة كامل من الحرير الفاخر',
            price: 199.99,
            discount: 20,
            imageUrl: 'https://via.placeholder.com/400x300?text=طقم+صلاة',
            store: 'samah',
            category: 'material_silk',
            stock: 5,
            isNew: false,
            isFeatured: true,
            createdAt: '2024-01-05T16:45:00Z'
        }
    ];
}

function formatProductData(data, id) {
    return {
        id: id,
        name: data.name || 'منتج بدون اسم',
        description: data.description || 'لا يوجد وصف',
        price: parseFloat(data.price) || 0,
        discount: parseFloat(data.discount) || 0,
        imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300?text=حرير',
        store: data.store || 'غير محدد',
        category: data.category || 'عام',
        stock: parseInt(data.stock) || 0,
        isNew: Boolean(data.isNew),
        isFeatured: Boolean(data.isFeatured),
        createdAt: data.createdAt || new Date().toISOString()
    };
}

function showNoProductsMessage() {
    const container = document.getElementById('productsContainer');
    const noProductsMsg = document.getElementById('noProductsMessage');
    
    if (container) {
        container.innerHTML = '';
    }
    
    if (noProductsMsg) {
        noProductsMsg.style.display = 'block';
        noProductsMsg.innerHTML = `
            <i class="fas fa-database fa-3x mb-3 text-muted"></i>
            <h3 class="mb-2">قاعدة البيانات فارغة</h3>
            <p class="text-muted mb-4">لا توجد منتجات في قاعدة البيانات حتى الآن.</p>
            <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> إعادة تحميل
                </button>
                <button class="btn btn-outline-primary" onclick="window.debugProducts.useMockData()">
                    <i class="fas fa-eye"></i> عرض بيانات تجريبية
                </button>
            </div>
        `;
    }
    
    updateProductsCount(0);
}
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    const noProductsMsg = document.getElementById('noProductsMessage');
    
    if (!container) {
        console.error('❌ عنصر productsContainer غير موجود!');
        return;
    }
    
    // إخفاء loading indicator
    showLoading(false);
    
    if (!products || products.length === 0) {
        container.innerHTML = '';
        
        if (noProductsMsg) {
            noProductsMsg.style.display = 'block';
            
            // رسالة مخصصة حسب نوع الفلترة
            let message = 'لا توجد منتجات في هذا التصنيف';
            let details = '';
            
            const urlParams = new URLSearchParams(window.location.search);
            const store = urlParams.get('store');
            const category = urlParams.get('category');
            
            if (store && category) {
                message = `لا توجد منتجات في "${category}"`;
                details = `المتجر: ${store}`;
            } else if (store) {
                message = `لا توجد منتجات في متجر "${store}"`;
            } else if (category) {
                message = `لا توجد منتجات في تصنيف "${category}"`;
            } else {
                message = 'لا توجد منتجات حالياً';
            }
            
            noProductsMsg.innerHTML = `
                <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                <h3 class="mb-2">${message}</h3>
                ${details ? `<p class="text-muted">${details}</p>` : ''}
                <button class="btn btn-primary mt-3" onclick="window.location.href='products.html'">
                    <i class="fas fa-store"></i> عرض جميع المنتجات
                </button>
            `;
        }
        
        updateProductsCount(0);
        return;
    }
    
    if (noProductsMsg) noProductsMsg.style.display = 'none';
    
    let html = '';
    
    products.forEach(function(product, index) {
        const finalPrice = product.discount > 0 
            ? product.price * (1 - product.discount / 100)
            : product.price;
        
        const storeBadge = product.store === 'tuka' 
            ? '<span class="badge bg-info">التقى</span>'
            : '<span class="badge bg-warning">السماح</span>';
        
        html += `
            <div class="col-md-4 col-sm-6 mb-4 product-item" style="opacity: 0; transform: translateY(20px);">
                <div class="card h-100 product-card">
                    <div class="position-relative overflow-hidden" style="height: 250px;">
                        <img src="${product.imageUrl}" 
                             class="card-img-top h-100 w-100" 
                             alt="${product.name}"
                             style="object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/400x300?text=حرير'">
                        
                        <div class="position-absolute top-0 start-0 m-2">
                            ${storeBadge}
                        </div>
                        
                        <div class="position-absolute top-0 end-0 m-2">
                            ${product.isNew ? '<span class="badge bg-success">جديد</span>' : ''}
                            ${product.discount > 0 ? '<span class="badge bg-danger">خصم ' + product.discount + '%</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary mb-2">${product.name}</h5>
                        
                        <p class="card-text text-muted mb-3 flex-grow-1">
                            ${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}
                        </p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h4 class="text-danger mb-0">${finalPrice.toFixed(2)} د.أ</h4>
                                    ${product.discount > 0 ? `
                                        <small class="text-muted text-decoration-line-through">
                                            ${product.price.toFixed(2)} د.أ
                                        </small>
                                    ` : ''}
                                </div>
                                
                                <span class="text-muted">
                                    <i class="fas fa-box"></i> ${product.stock}
                                </span>
                            </div>
                            
                            <button class="btn btn-primary w-100" onclick="addToCart('${product.id}')">
                                <i class="fas fa-shopping-cart"></i> أضف إلى السلة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateProductsCount(products.length);
    
    // إضافة تأثيرات الظهور
    animateProducts();
}

function updateProductsCount(count) {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.innerHTML = `
            <i class="fas fa-box"></i>
            عرض <strong>${count}</strong> منتج
        `;
    }
}

function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

function showErrorMessage(message) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h4>حدث خطأ</h4>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary mt-2">
                    <i class="fas fa-redo"></i> إعادة المحاولة
                </button>
            </div>
        </div>
    `;
    
    showLoading(false);
}

function setupEventListeners() {
    // حدث الترتيب
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const value = this.value;
            alert('ميزة الترتيب حسب ' + value + ' قيد التطوير');
        });
    }
    
    // زر العودة للأعلى
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function animateProducts() {
    const items = document.querySelectorAll('.product-item');
    items.forEach(function(item, index) {
        setTimeout(function() {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// دالة إضافة إلى السلة
window.addToCart = function(productId) {
    const product = allProducts.find(function(p) { return p.id === productId; });
    if (product) {
        alert('تم إضافة "' + product.name + '" إلى السلة');
        
        // تحديث عداد السلة
        updateCartUI();
    }
};

// تحديث عربة التسوق
function updateCartUI() {
    try {
        const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
        const totalItems = cart.reduce(function(sum, item) {
            return sum + (item.quantity || 0);
        }, 0);
        
        const counter = document.getElementById('cartCount');
        if (counter) {
            counter.textContent = totalItems > 99 ? '99+' : totalItems;
            counter.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.warn('⚠️ خطأ في تحديث عربة التسوق:', error);
    }
}

// أدوات التصحيح للكونسول
window.debugProducts = {
    reload: function() { location.reload(); },
    clearFilters: function() { window.location.href = 'products.html'; },
    testURL: function(store, category) {
        window.location.href = 'products.html?store=' + encodeURIComponent(store) + '&category=' + encodeURIComponent(category);
    },
    getAllProducts: function() { return allProducts; },
    getDB: function() { return db; }
};

console.log('🚀 صفحة المنتجات جاهزة! استخدم debugProducts في الكونسول للاختبار.');