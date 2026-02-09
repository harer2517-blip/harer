/**
 * Dashboard Main Controller - النسخة المبسطة والمتجانسة
 */

// حالة التطبيق
const appState = {
    currentPage: 'dashboard',
    stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalCategories: 0,
        pendingOrders: 0,
        totalRevenue: 0
    }
};

// تحميل الإحصائيات
async function loadStats() {
    try {
        // تحقق من وجود Firebase
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            console.warn('⚠️ Firebase غير متوفر، استخدام بيانات وهمية');
            loadMockStats();
            return;
        }
        
        const db = firebase.firestore();
        
        // تحميل الإحصائيات بشكل متوازي
        const [
            productsSnapshot,
            ordersSnapshot,
            categoriesSnapshot,
            pendingSnapshot
        ] = await Promise.all([
            db.collection('products').get(),
            db.collection('orders').get(),
            db.collection('categories').get(),
            db.collection('orders').where('status', '==', 'pending').get()
        ]);
        
        // تحديث الإحصائيات
        appState.stats.totalProducts = productsSnapshot.size;
        appState.stats.totalOrders = ordersSnapshot.size;
        appState.stats.totalCategories = categoriesSnapshot.size;
        appState.stats.pendingOrders = pendingSnapshot.size;
        
        // حساب الإيرادات
        let revenue = 0;
        const completedOrders = await db.collection('orders')
            .where('status', '==', 'completed')
            .get();
        
        completedOrders.forEach(doc => {
            revenue += parseFloat(doc.data().total || 0);
        });
        
        appState.stats.totalRevenue = revenue;
        
        // تحديث الواجهة
        updateStatsDisplay();
        
        console.log('✅ تم تحميل الإحصائيات بنجاح');
        
    } catch (error) {
        console.error('❌ خطأ في تحميل الإحصائيات:', error);
        loadMockStats();
    }
}

// بيانات وهمية للعرض
function loadMockStats() {
    appState.stats = {
        totalProducts: 42,
        totalOrders: 17,
        totalCategories: 8,
        pendingOrders: 3,
        totalRevenue: 5240.50
    };
    updateStatsDisplay();
}

// تحديث عرض الإحصائيات
function updateStatsDisplay() {
    const stats = appState.stats;
    
    // تحديث العداد في الشريط الجانبي
    document.getElementById('productsCountBadge').textContent = stats.totalProducts;
    document.getElementById('categoriesCountBadge').textContent = stats.totalCategories;
    document.getElementById('ordersCountBadge').textContent = stats.totalOrders;
    
    // تحديث الإحصائيات في الداشبورد إذا كانت الصفحة مفتوحة
    const statElements = {
        'liveTotalProducts': stats.totalProducts,
        'liveTotalOrders': stats.totalOrders,
        'livePendingOrders': stats.pendingOrders,
        'liveTotalRevenue': stats.totalRevenue.toFixed(2),
        'statProducts': stats.totalProducts,
        'statOrders': stats.totalOrders,
        'statRevenue': stats.totalRevenue.toFixed(2),
        'statPending': stats.pendingOrders,
        'quickProducts': stats.totalProducts,
        'quickCategories': stats.totalCategories,
        'quickPending': stats.pendingOrders,
        'quickRevenue': `${stats.totalRevenue.toFixed(2)} د.أ`
    };
    
    Object.keys(statElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = statElements[id];
        }
    });
}

// تحميل صفحة المنتجات
async function loadProductsPage() {
    try {
        let products = [];
        
        if (firebase.apps.length && firebase.firestore) {
            const db = firebase.firestore();
            const snapshot = await db.collection('products').get();
            products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } else {
            // بيانات وهمية
            products = [
                { id: '1', name: 'جرابات حرير فاخرة', price: 99.99, category: 'جرابات حرير', stock: 15, store: 'samah' },
                { id: '2', name: 'شالات حرير أنيقة', price: 149.99, category: 'شالات حرير', stock: 8, store: 'tuka' },
                { id: '3', name: 'جرابات قطن مريحة', price: 49.99, category: 'جرابات قطن', stock: 25, store: 'samah' }
            ];
        }
        
        const content = `
            <div class="products-page">
                <div class="card">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">إدارة المنتجات</h4>
                        <button class="btn btn-light btn-sm" onclick="openAddProductModal()">
                            <i class="fas fa-plus"></i> إضافة منتج
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>اسم المنتج</th>
                                        <th>السعر</th>
                                        <th>التصنيف</th>
                                        <th>المخزون</th>
                                        <th>المتجر</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map((product, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${product.name}</td>
                                            <td>${product.price.toFixed(2)} د.أ</td>
                                            <td>${product.category}</td>
                                            <td>
                                                <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                                                    ${product.stock}
                                                </span>
                                            </td>
                                            <td>${product.store === 'samah' ? 'السماح' : 'التقى'}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${product.id}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('contentContainer').innerHTML = content;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        showErrorMessage('فشل في تحميل المنتجات');
    }
}

// دوال مساعدة
function openAddProductModal() {
    alert('نافذة إضافة منتج - سيتم تفعيلها قريباً');
}

function editProduct(id) {
    alert(`تحرير المنتج ${id} - سيتم تفعيلها قريباً`);
}

function deleteProduct(id) {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
        alert(`حذف المنتج ${id} - سيتم تفعيلها قريباً`);
    }
}

function showErrorMessage(message) {
    document.getElementById('contentContainer').innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i>
            ${message}
        </div>
    `;
}

// تصدير الدوال للاستخدام العام
window.loadStats = loadStats;
window.loadProductsPage = loadProductsPage;
window.openAddProductModal = openAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadPage = function(page) {
    if (page === 'products') {
        loadProductsPage();
    } else if (page === 'dashboard') {
        // إعادة تحميل الداشبورد
        document.getElementById('contentContainer').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">جاري التحميل...</span>
                </div>
                <p class="mt-3">جاري تحميل لوحة التحكم...</p>
            </div>
        `;
        
        setTimeout(() => {
            // إعادة تحميل الداشبورد من الصفحة الرئيسية
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
        }, 500);
    } else {
        document.getElementById('contentContainer').innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                صفحة "${page}" قيد التطوير
            </div>
        `;
    }
};

// بدء تحميل الإحصائيات عند التحميل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadStats, 1000);
    });
} else {
    setTimeout(loadStats, 1000);
}