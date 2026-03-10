/**
 * Inventory Management Module
 */

class InventoryManager {
    constructor() {
        this.db = window.appState?.firebase?.db;
        this.inventory = [];
        this.lowStockThreshold = 10;
        this.outOfStockThreshold = 0;
    }

    /**
     * تحميل بيانات المخزون
     */
    async loadInventory() {
        try {
            if (!this.db) {
                console.warn('⚠️ Firebase غير متصل، استخدام بيانات وهمية');
                return this.loadMockInventory();
            }

            const snapshot = await this.db.collection('products').get();
            this.inventory = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return this.inventory;
        } catch (error) {
            console.error('❌ خطأ في تحميل المخزون:', error);
            return this.loadMockInventory();
        }
    }

    /**
     * تحديث كمية المخزون
     */
    async updateStock(productId, quantity, operation = 'add') {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            const productRef = this.db.collection('products').doc(productId);
            const productDoc = await productRef.get();
            
            if (!productDoc.exists) {
                throw new Error('المنتج غير موجود');
            }

            const currentStock = productDoc.data().stock || 0;
            let newStock = currentStock;

            switch (operation) {
                case 'add':
                    newStock = currentStock + quantity;
                    break;
                case 'subtract':
                    newStock = currentStock - quantity;
                    if (newStock < 0) newStock = 0;
                    break;
                case 'set':
                    newStock = quantity;
                    break;
                default:
                    throw new Error('عملية غير صالحة');
            }

            await productRef.update({
                stock: newStock,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // تسجيل حركة المخزون
            await this.logStockMovement(productId, operation, quantity, newStock);
            
            return newStock;
        } catch (error) {
            console.error('❌ خطأ في تحديث المخزون:', error);
            throw error;
        }
    }

    /**
     * تسجيل حركة المخزون
     */
    async logStockMovement(productId, operation, quantity, newStock) {
        try {
            if (!this.db) return;

            await this.db.collection('stock_movements').add({
                productId: productId,
                operation: operation,
                quantity: quantity,
                newStock: newStock,
                userId: window.appState?.user?.uid,
                userName: window.appState?.user?.name,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('❌ خطأ في تسجيل حركة المخزون:', error);
        }
    }

    /**
     * الحصول على المنتجات منخفضة المخزون
     */
    async getLowStockProducts() {
        try {
            if (!this.db) {
                return this.loadMockInventory().filter(product => 
                    product.stock <= this.lowStockThreshold && product.stock > this.outOfStockThreshold
                );
            }

            const snapshot = await this.db.collection('products')
                .where('stock', '<=', this.lowStockThreshold)
                .where('stock', '>', this.outOfStockThreshold)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ خطأ في الحصول على المنتجات منخفضة المخزون:', error);
            return [];
        }
    }

    /**
     * الحصول على المنتجات النافذة من المخزون
     */
    async getOutOfStockProducts() {
        try {
            if (!this.db) {
                return this.loadMockInventory().filter(product => 
                    product.stock === this.outOfStockThreshold
                );
            }

            const snapshot = await this.db.collection('products')
                .where('stock', '==', this.outOfStockThreshold)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ خطأ في الحصول على المنتجات النافذة:', error);
            return [];
        }
    }

    /**
     * بيانات وهمية للعرض
     */
    loadMockInventory() {
        return [
            {
                id: '1',
                name: 'جرابات حرير فاخرة',
                sku: 'GRB-SLK-001',
                category: 'جرابات حرير',
                store: 'samah',
                stock: 5, // منخفض المخزون
                minStock: 10,
                maxStock: 50,
                cost: 60.00,
                price: 99.99,
                lastRestock: '2024-01-10'
            },
            {
                id: '2',
                name: 'شالات حرير أنيقة',
                sku: 'SHA-SLK-001',
                category: 'شالات حرير',
                store: 'tuka',
                stock: 0, // نافذ من المخزون
                minStock: 5,
                maxStock: 30,
                cost: 90.00,
                price: 149.99,
                lastRestock: '2024-01-05'
            },
            {
                id: '3',
                name: 'جرابات قطن مريحة',
                sku: 'GRB-CTN-001',
                category: 'جرابات قطن',
                store: 'samah',
                stock: 25, // مخزون جيد
                minStock: 15,
                maxStock: 100,
                cost: 25.00,
                price: 49.99,
                lastRestock: '2024-01-15'
            },
            {
                id: '4',
                name: 'شالات قطن ناعمة',
                sku: 'SHA-CTN-001',
                category: 'شالات قطن',
                store: 'tuka',
                stock: 3, // منخفض المخزون
                minStock: 10,
                maxStock: 40,
                cost: 35.00,
                price: 79.99,
                lastRestock: '2024-01-12'
            }
        ];
    }

    /**
     * توليد HTML لعرض المخزون
     */
    generateInventoryHTML(inventory) {
        return `
            <div class="inventory-overview">
                <!-- بطاقات المخزون -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card border-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">المخزون الجيد</h6>
                                        <h3 class="text-success" id="goodStockCount">0</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-check-circle fa-2x text-success"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card border-warning">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">منخفض المخزون</h6>
                                        <h3 class="text-warning" id="lowStockCount">0</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card border-danger">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">نافذ من المخزون</h6>
                                        <h3 class="text-danger" id="outOfStockCount">0</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-times-circle fa-2x text-danger"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card border-info">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">إجمالي القيمة</h6>
                                        <h3 class="text-info" id="totalValue">0 د.أ</h3>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-money-bill-wave fa-2x text-info"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- جدول المخزون -->
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">تفاصيل المخزون</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table data-table">
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>الرمز</th>
                                        <th>المتجر</th>
                                        <th>المخزون الحالي</th>
                                        <th>الحد الأدنى</th>
                                        <th>الحد الأقصى</th>
                                        <th>حالة المخزون</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${inventory.map(product => {
                                        const stockStatus = this.getStockStatus(product.stock, product.minStock);
                                        return `
                                            <tr>
                                                <td>
                                                    <strong>${product.name}</strong>
                                                    <br>
                                                    <small class="text-muted">${product.category}</small>
                                                </td>
                                                <td>${product.sku}</td>
                                                <td>
                                                    <span class="badge ${product.store === 'samah' ? 'badge-info' : 'badge-primary'}">
                                                        ${product.store === 'samah' ? 'السماح' : 'التقى'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="d-flex align-items-center">
                                                        <input type="number" 
                                                               class="form-control form-control-sm" 
                                                               style="width: 80px;"
                                                               value="${product.stock}"
                                                               onchange="updateProductStock('${product.id}', this.value)"
                                                               min="0">
                                                    </div>
                                                </td>
                                                <td>${product.minStock || 0}</td>
                                                <td>${product.maxStock || 0}</td>
                                                <td>
                                                    <span class="badge ${stockStatus.class}">
                                                        <i class="${stockStatus.icon}"></i>
                                                        ${stockStatus.text}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div class="btn-group btn-group-sm" role="group">
                                                        <button class="btn btn-outline" onclick="restockProduct('${product.id}')"
                                                                title="إعادة التخزين">
                                                            <i class="fas fa-arrow-up"></i>
                                                        </button>
                                                        <button class="btn btn-outline" onclick="viewStockHistory('${product.id}')"
                                                                title="سجل المخزون">
                                                            <i class="fas fa-history"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * الحصول على حالة المخزون
     */
    getStockStatus(currentStock, minStock = 0) {
        if (currentStock === 0) {
            return {
                text: 'نافذ',
                class: 'badge-danger',
                icon: 'fas fa-times-circle'
            };
        } else if (currentStock <= this.lowStockThreshold) {
            return {
                text: 'منخفض',
                class: 'badge-warning',
                icon: 'fas fa-exclamation-triangle'
            };
        } else if (currentStock <= minStock) {
            return {
                text: 'تحت الحد',
                class: 'badge-warning',
                icon: 'fas fa-arrow-down'
            };
        } else {
            return {
                text: 'جيد',
                class: 'badge-success',
                icon: 'fas fa-check-circle'
            };
        }
    }

    /**
     * تحديث إحصائيات المخزون
     */
    updateInventoryStats(inventory) {
        const goodStock = inventory.filter(p => p.stock > this.lowStockThreshold).length;
        const lowStock = inventory.filter(p => p.stock <= this.lowStockThreshold && p.stock > 0).length;
        const outOfStock = inventory.filter(p => p.stock === 0).length;
        
        const totalValue = inventory.reduce((sum, product) => {
            return sum + (product.stock * (product.cost || product.price * 0.6));
        }, 0);
        
        // تحديث العداد
        const goodStockEl = document.getElementById('goodStockCount');
        const lowStockEl = document.getElementById('lowStockCount');
        const outOfStockEl = document.getElementById('outOfStockCount');
        const totalValueEl = document.getElementById('totalValue');
        
        if (goodStockEl) goodStockEl.textContent = goodStock;
        if (lowStockEl) lowStockEl.textContent = lowStock;
        if (outOfStockEl) outOfStockEl.textContent = outOfStock;
        if (totalValueEl) totalValueEl.textContent = totalValue.toFixed(2) + ' د.أ';
    }
}

// إنشاء نسخة من مدير المخزون
const inventoryManager = new InventoryManager();

// دوال عامة للمخزون
async function updateProductStock(productId, newStock) {
    if (confirm('هل تريد تحديث كمية المخزون؟')) {
        try {
            await inventoryManager.updateStock(productId, parseInt(newStock), 'set');
            alert('تم تحديث المخزون بنجاح');
            // إعادة تحميل صفحة المخزون
            if (window.appState.currentPage === 'inventory') {
                loadPageContent('inventory');
            }
        } catch (error) {
            alert('فشل تحديث المخزون: ' + error.message);
        }
    }
}

async function restockProduct(productId) {
    const quantity = prompt('أدخل كمية المنتج التي تريد إضافتها للمخزون:', '10');
    if (quantity && !isNaN(quantity)) {
        try {
            await inventoryManager.updateStock(productId, parseInt(quantity), 'add');
            alert('تمت إعادة التخزين بنجاح');
            if (window.appState.currentPage === 'inventory') {
                loadPageContent('inventory');
            }
        } catch (error) {
            alert('فشل إعادة التخزين: ' + error.message);
        }
    }
}

function viewStockHistory(productId) {
    alert(`عرض سجل المخزون للمنتج ${productId}. سيتم تفعيل هذه الميزة قريباً.`);
}

// تصدير الدوال للاستخدام العام
window.inventoryManager = inventoryManager;
window.updateProductStock = updateProductStock;
window.restockProduct = restockProduct;
window.viewStockHistory = viewStockHistory;