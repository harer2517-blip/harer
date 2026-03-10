/**
 * صفحة المنتجات الرئيسية - عرض احترافي مع معرض صور
 */

// تهيئة المتغيرات
let allProducts = [];
let db = null;

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 الصفحة حمّلت');
    
    // الانتظار قليلاً لتحميل Firebase
    setTimeout(initApp, 500);
});

function initApp() {
    console.log('🚀 بدء التطبيق...');
    
    // تحقق من وجود Firebase
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase غير محمل!');
        showFirebaseError();
        return;
    }
    
    try {
        // تهيئة Firebase
        if (!firebase.apps.length) {
            const firebaseConfig = {
                apiKey: "AIzaSyCMoFpEmsjbYPjYAl_LEX8GjC5so8kn9-Y",
                authDomain: "harir-92e27.firebaseapp.com",
                projectId: "harir-92e27",
                storageBucket: "harir-92e27.firebasestorage.app",
                messagingSenderId: "787234689138",
                appId: "1:787234689138:web:1d91758ff0d5c1fa9f72eb"
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
        }, 500);
    }
}

function setupUI() {
    updateProductsCount(0);
}

async function loadProducts(storeFilter, categoryFilter) {
    try {
        showLoading(true);
        
        console.log('📥 جاري تحميل المنتجات...');
        
        if (!db) {
            throw new Error('قاعدة البيانات غير متاحة');
        }
        
        const snapshot = await db.collection('products').get();
        
        if (snapshot.empty) {
            console.log('📭 لا توجد منتجات في قاعدة البيانات');
            showNoProductsMessage();
            return;
        }
        
        allProducts = [];
        snapshot.forEach(function(doc) {
            const data = doc.data();
            console.log('📦 بيانات المنتج الخام:', data); // للتأكد من البيانات
            allProducts.push(formatProductData(data, doc.id));
        });
        
        console.log('📊 المنتجات بعد التنسيق:', allProducts); // للتأكد من التنسيق
        
        // تطبيق الفلاتر محلياً
        applyFiltersLocally(storeFilter, categoryFilter);
        
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        showErrorMessage('تعذر تحميل المنتجات: ' + error.message);
    } finally {
        showLoading(false);
    }
}

function formatProductData(data, id) {
    // معالجة الصور - الأهم هنا
    let images = [];
    
    // التحقق من وجود مصفوفة images
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        images = data.images.filter(img => img && img.trim() !== '');
        console.log(`✅ تم العثور على ${images.length} صور في مصفوفة images للمنتج ${data.name}`);
    }
    // إذا لم توجد مصفوفة images، نستخدم imageUrl
    else if (data.imageUrl) {
        images = [data.imageUrl];
        console.log(`✅ تم العثور على صورة واحدة في imageUrl للمنتج ${data.name}`);
    }
    // إذا لم توجد أي صور
    else {
        images = ['https://via.placeholder.com/400x300?text=لا+توجد+صورة'];
        console.log(`⚠️ لا توجد صور للمنتج ${data.name}`);
    }
    
    return {
        id: id,
        name: data.name || 'منتج بدون اسم',
        description: data.description || 'لا يوجد وصف',
        price: parseFloat(data.price) || 0,
        discount: parseFloat(data.discount) || 0,
        images: images, // مصفوفة الصور كاملة
        imageUrl: images[0], // أول صورة للعرض السريع
        store: data.store || 'غير محدد',
        category: data.category || 'عام',
        stock: parseInt(data.stock) || 0,
        isNew: Boolean(data.isNew),
        code: data.code || '',
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()) : new Date().toISOString()
    };
}

function applyFiltersLocally(storeFilter, categoryFilter) {
    let filteredProducts = [...allProducts];
    
    if (storeFilter && storeFilter.trim() !== '') {
        filteredProducts = filteredProducts.filter(function(product) {
            return product.store === storeFilter.trim();
        });
    }
    
    if (categoryFilter && categoryFilter.trim() !== '') {
        filteredProducts = filteredProducts.filter(function(product) {
            return product.category === categoryFilter.trim();
        });
    }
    
    // ترتيب حسب التاريخ
    filteredProducts.sort(function(a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    console.log(`✅ ${filteredProducts.length} منتج للعرض`);
    displayProducts(filteredProducts);
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
            
            let message = 'لا توجد منتجات في هذا التصنيف';
            
            const urlParams = new URLSearchParams(window.location.search);
            const store = urlParams.get('store');
            const category = urlParams.get('category');
            
            if (store && category) {
                message = `لا توجد منتجات في "${category}" لمتجر "${store}"`;
            } else if (store) {
                message = `لا توجد منتجات في متجر "${store}"`;
            } else if (category) {
                message = `لا توجد منتجات في تصنيف "${category}"`;
            }
            
            noProductsMsg.innerHTML = `
                <i class="fas fa-box-open fa-4x mb-3 text-muted"></i>
                <h3>${message}</h3>
                <p>جرب تصنيفاً آخر أو تصفح جميع المنتجات</p>
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
    
    products.forEach(function(product) {
        const finalPrice = product.discount > 0 
            ? (product.price * (1 - product.discount / 100)).toFixed(2)
            : product.price.toFixed(2);
        
        const storeBadge = product.store === "متجر التقى"
            ? '<span class="badge bg-info">التقى</span>'
            : '<span class="badge bg-warning">السماح</span>';
        
        // عدد الصور
        const imagesCount = product.images ? product.images.length : 1;
        
        html += `
            <div class="col-md-4 col-sm-6 mb-4 product-item" style="opacity: 0; transform: translateY(20px);">
                <div class="card h-100 product-card" onclick="openProductDialog('${product.id}')" style="cursor: pointer;">
                    <div class="position-relative overflow-hidden" style="height: 250px;">
                        <img src="${product.imageUrl}" 
                             class="card-img-top h-100 w-100" 
                             alt="${product.name}"
                             style="object-fit: cover; transition: transform 0.3s;"
                             onerror="this.src='https://via.placeholder.com/400x300?text=حرير'">
                        
                        ${imagesCount > 1 ? `
                            <div class="position-absolute bottom-0 start-0 m-2 bg-dark bg-opacity-75 text-white px-2 py-1 rounded" style="font-size: 12px; backdrop-filter: blur(5px);">
                                <i class="fas fa-images ms-1"></i> ${imagesCount} صور
                            </div>
                        ` : ''}
                        
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
                            ${product.description ? product.description.substring(0, 80) : ''}${product.description && product.description.length > 80 ? '...' : ''}
                        </p>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 class="text-danger mb-0">${finalPrice} د.أ</h4>
                                    ${product.discount > 0 ? `
                                        <small class="text-muted text-decoration-line-through">
                                            ${product.price.toFixed(2)} د.أ
                                        </small>
                                    ` : ''}
                                </div>
                                
                                <span class="text-muted">
                                    <i class="fas fa-box"></i> ${product.stock || 0}
                                </span>
                            </div>
                            
                            <div class="text-center mt-3 text-muted">
                                <small><i class="fas fa-eye ms-1"></i> اضغط لعرض التفاصيل</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateProductsCount(products.length);
    animateProducts();
}

// دالة فتح ديالوغ تفاصيل المنتج
window.openProductDialog = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('المنتج غير موجود:', productId);
        return;
    }
    
    console.log('فتح المنتج:', product); // للتأكد من البيانات
    console.log('صور المنتج:', product.images); // للتأكد من الصور
    
    // تجهيز الصور - استخدام مصفوفة images مباشرة
    let images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
    
    console.log('الصور المعروضة:', images); // للتأكد من الصور
    
    // حساب السعر بعد الخصم
    const finalPrice = product.discount > 0 
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price.toFixed(2);
    
    // تحديد لون المتجر
    const storeColor = product.store === "متجر التقى" ? "info" : "warning";
    const storeIcon = product.store === "متجر التقى" ? "fa-mosque" : "fa-store";
    
    // إنشاء الصور المصغرة
    let thumbnailsHtml = '';
    if (images.length > 1) {
        thumbnailsHtml = `
            <div class="d-flex gap-2 overflow-auto pb-2 mt-3" style="scrollbar-width: thin; padding: 5px; justify-content: center;">
                ${images.map((img, idx) => `
                    <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" 
                         onclick="changeProductImage(this, '${img}')"
                         style="cursor: pointer; border: 3px solid ${idx === 0 ? '#571c24' : 'transparent'}; border-radius: 10px; overflow: hidden; min-width: 70px; height: 70px; transition: all 0.3s;">
                        <img src="${img}" 
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='https://via.placeholder.com/70x70?text=خطأ'">
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // إنشاء الديالوغ
    const dialogHTML = `
        <div id="productDialog" class="modal fade show" style="display: block; background: rgba(0,0,0,0.8); z-index: 10000;" onclick="closeProductDialog(event)">
            <div class="modal-dialog modal-lg modal-dialog-centered" onclick="event.stopPropagation()">
                <div class="modal-content" style="border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
                    
                    <!-- رأس الديالوغ -->
                    <div class="modal-header" style="background: #571c24; color: white; border: none; padding: 15px 20px;">
                        <h5 class="modal-title">
                            <i class="fas fa-box-open ms-2"></i>
                            ${product.name}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" onclick="closeProductDialog()" aria-label="Close"></button>
                    </div>
                    
                    <!-- جسم الديالوغ -->
                    <div class="modal-body p-4">
                        <div class="row">
                            <!-- قسم الصور -->
                            <div class="col-md-6 mb-4 mb-md-0">
                                <div class="product-gallery">
                                    <!-- الصورة الرئيسية -->
                                    <div class="main-image-container mb-3" style="background: #f8f9fa; border-radius: 15px; padding: 15px; text-align: center;">
                                        <img id="mainProductImage" src="${images[0]}" 
                                             class="img-fluid" 
                                             alt="${product.name}"
                                             style="max-height: 300px; object-fit: contain; border-radius: 10px;"
                                             onerror="this.src='https://via.placeholder.com/400x300?text=حرير'">
                                    </div>
                                    
                                    <!-- الصور المصغرة -->
                                    ${thumbnailsHtml}
                                </div>
                            </div>
                            
                            <!-- معلومات المنتج -->
                            <div class="col-md-6">
                                <!-- التصنيف والمتجر -->
                                <div class="d-flex gap-2 mb-3 flex-wrap">
                                    <span class="badge bg-${storeColor} p-2">
                                        <i class="fas ${storeIcon} ms-1"></i> ${product.store || 'غير محدد'}
                                    </span>
                                    <span class="badge bg-secondary p-2">
                                        <i class="fas fa-tag ms-1"></i> ${product.category || 'غير مصنف'}
                                    </span>
                                    ${product.isNew ? '<span class="badge bg-success p-2"><i class="fas fa-star ms-1"></i> جديد</span>' : ''}
                                </div>
                                
                                <!-- السعر -->
                                <div class="mb-4 p-3" style="background: #f8f9fa; border-radius: 12px;">
                                    <div class="d-flex align-items-baseline gap-3 flex-wrap">
                                        <span class="display-6 fw-bold" style="color: #571c24;">${finalPrice} د.أ</span>
                                        ${product.discount > 0 ? `
                                            <span class="text-muted text-decoration-line-through">${product.price.toFixed(2)} د.أ</span>
                                            <span class="badge bg-danger">خصم ${product.discount}%</span>
                                        ` : ''}
                                    </div>
                                </div>
                                
                                <!-- المخزون -->
                                <div class="mb-4">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <i class="fas fa-boxes" style="color: #571c24;"></i>
                                        <span>المخزون المتوفر: <strong>${product.stock || 0}</strong></span>
                                    </div>
                                    <div class="progress" style="height: 10px; border-radius: 5px;">
                                        <div class="progress-bar bg-${product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}" 
                                             role="progressbar" 
                                             style="width: ${Math.min((product.stock / 50) * 100, 100)}%;"></div>
                                    </div>
                                </div>
                                
                                <!-- الوصف -->
                                <div class="mb-4">
                                    <h6 style="color: #571c24; font-weight: bold; margin-bottom: 10px;">
                                        <i class="fas fa-align-left ms-2"></i>الوصف:
                                    </h6>
                                    <p class="text-muted" style="line-height: 1.8; background: #f8f9fa; padding: 15px; border-radius: 10px;">
                                        ${product.description || 'لا يوجد وصف لهذا المنتج'}
                                    </p>
                                </div>
                                
                                <!-- كود المنتج إن وجد -->
                                ${product.code ? `
                                    <div class="mb-4">
                                        <small class="text-muted">
                                            <i class="fas fa-barcode ms-1"></i> كود المنتج: ${product.code}
                                        </small>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- أزرار الديالوغ -->
                    <div class="modal-footer" style="background: #f8f9fa; border-top: 1px solid #dee2e6;">
                        <button type="button" class="btn btn-secondary" onclick="closeProductDialog()">
                            <i class="fas fa-times ms-2"></i>إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إزالة أي ديالوغ سابق
    const oldDialog = document.getElementById('productDialog');
    if (oldDialog) {
        oldDialog.remove();
    }
    
    // إضافة الديالوغ إلى الصفحة
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
};

// دالة تغيير الصورة الرئيسية
window.changeProductImage = function(thumbnail, imageUrl) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageUrl;
        
        // تحديث الحالة النشطة للصور المصغرة
        document.querySelectorAll('.thumbnail-item').forEach(thumb => {
            thumb.style.borderColor = 'transparent';
        });
        thumbnail.style.borderColor = '#571c24';
    }
};

// دالة إغلاق الديالوغ
window.closeProductDialog = function(event) {
    if (event && event.target === document.getElementById('productDialog')) {
        removeDialog();
    } else {
        removeDialog();
    }
};

function removeDialog() {
    const dialog = document.getElementById('productDialog');
    if (dialog) {
        dialog.remove();
        document.body.style.overflow = '';
    }
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

function showNoProductsMessage() {
    const container = document.getElementById('productsContainer');
    const noProductsMsg = document.getElementById('noProductsMessage');
    
    if (container) {
        container.innerHTML = '';
    }
    
    if (noProductsMsg) {
        noProductsMsg.style.display = 'block';
    }
    
    updateProductsCount(0);
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
            sortProducts(value);
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
    
    // إغلاق المعرض بالضغط على ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductDialog();
        }
    });
}

function sortProducts(sortType) {
    if (!allProducts || allProducts.length === 0) return;
    
    let sorted = [...allProducts];
    
    switch(sortType) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // newest
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    displayProducts(sorted);
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

// إضافة بعض الأنماط الإضافية
const style = document.createElement('style');
style.textContent = `
    .product-card {
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(87, 28, 36, 0.15) !important;
    }
    
    .product-card:hover img {
        transform: scale(1.1);
    }
    
    .thumbnail-item:hover {
        transform: scale(1.1);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    
    .badge {
        font-size: 12px;
        padding: 5px 10px;
    }
    
    .modal {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
