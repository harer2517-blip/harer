/**
 * Products Management Module
 */
// انتظر حتى يتم تحميل Firebase
document.addEventListener('DOMContentLoaded', function() {
    // تحقق من وجود Firebase
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase غير محمل! تأكد من تضمين SDK');
        return;
    }
    
    console.log('✅ Firebase محمل:', typeof firebase);
    
    // تأخير التنفيذ لضمان تحميل Firebase
    setTimeout(initApp, 1000);
});

function initApp() {
    console.log('🚀 بدء التطبيق...');
    
    // تأكد من تهيئة Firebase
    if (!firebase.apps.length) {
        try {
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
        } catch (error) {
            console.error('❌ خطأ في تهيئة Firebase:', error);
            return;
        }
    }
    
    // استدع fetchData
    fetchData('tuka', 'tuka_silk');
}

class ProductsManager {
    constructor() {
        this.db = window.appState?.firebase?.db;
        this.products = [];
        this.currentProduct = null;
    }

    /**
     * تحميل جميع المنتجات
     */
    async loadAllProducts() {
        try {
            if (!this.db) {
                console.warn('⚠️ Firebase غير متصل، استخدام بيانات وهمية');
                return this.loadMockProducts();
            }

            const snapshot = await this.db.collection('products').get();
            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return this.products;
        } catch (error) {
            console.error('❌ خطأ في تحميل المنتجات:', error);
            return this.loadMockProducts();
        }
    }

    /**
     * تحميل منتجات متجر محدد
     */
    async loadStoreProducts(store) {
        try {
            if (!this.db) {
                return this.loadMockProducts().filter(p => p.store === store);
            }

            const snapshot = await this.db.collection('products')
                .where('store', '==', store)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`❌ خطأ في تحميل منتجات ${store}:`, error);
            return [];
        }
    }

    /**
     * إضافة منتج جديد
     */
    async addProduct(productData) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            const productRef = await this.db.collection('products').add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: window.appState?.user?.uid
            });

            return productRef.id;
        } catch (error) {
            console.error('❌ خطأ في إضافة المنتج:', error);
            throw error;
        }
    }

    /**
     * تحديث منتج
     */
    async updateProduct(productId, productData) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            await this.db.collection('products').doc(productId).update({
                ...productData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ خطأ في تحديث المنتج:', error);
            throw error;
        }
    }

    /**
     * حذف منتج
     */
    async deleteProduct(productId) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            await this.db.collection('products').doc(productId).delete();
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف المنتج:', error);
            throw error;
        }
    }

    /**
     * البحث عن منتجات
     */
    async searchProducts(query) {
        try {
            if (!this.db) {
                return this.products.filter(product => 
                    product.name?.toLowerCase().includes(query.toLowerCase()) ||
                    product.description?.toLowerCase().includes(query.toLowerCase())
                );
            }

            // Note: Firestore doesn't support full-text search natively
            // In a real app, you would use Algolia or similar service
            const snapshot = await this.db.collection('products')
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ خطأ في البحث:', error);
            return [];
        }
    }

    /**
     * فلترة المنتجات حسب التصنيف
     */
    async filterByCategory(categoryId) {
        try {
            if (!this.db) {
                return this.products.filter(product => product.category === categoryId);
            }

            const snapshot = await this.db.collection('products')
                .where('category', '==', categoryId)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('❌ خطأ في الفلترة:', error);
            return [];
        }
    }

    /**
     * تحديث المخزون
     */
    async updateStock(productId, newStock) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            await this.db.collection('products').doc(productId).update({
                stock: newStock,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ خطأ في تحديث المخزون:', error);
            throw error;
        }
    }

    /**
     * بيانات وهمية للعرض
     */
    loadMockProducts() {
        return [
            {
                id: '1',
                name: 'جرابات حرير فاخرة',
                description: 'جرابات عالية الجودة مصنوعة من الحرير الطبيعي الفاخر',
                price: 99.99,
                originalPrice: 129.99,
                category: 'samah_silk',
                store: 'samah',
                stock: 15,
                sku: 'GRB-SLK-001',
                images: [],
                isActive: true,
                createdAt: '2024-01-01',
                tags: ['حرير', 'جرابات', 'فاخر']
            },
            {
                id: '2',
                name: 'شالات حرير أنيقة',
                description: 'شالات أنيقة ومريحة من الحرير الخالص',
                price: 149.99,
                originalPrice: 179.99,
                category: 'tuka_silk',
                store: 'tuka',
                stock: 8,
                sku: 'SHA-SLK-001',
                images: [],
                isActive: true,
                createdAt: '2024-01-02',
                tags: ['حرير', 'شالات', 'أنيق']
            },
            {
                id: '3',
                name: 'جرابات قطن مريحة',
                description: 'جرابات يومية مريحة مصنوعة من القطن المصري عالي الجودة',
                price: 49.99,
                originalPrice: 59.99,
                category: 'samah_cotton',
                store: 'samah',
                stock: 25,
                sku: 'GRB-CTN-001',
                images: [],
                isActive: true,
                createdAt: '2024-01-03',
                tags: ['قطن', 'جرابات', 'مريح']
            }
        ];
    }

    /**
     * توليد نموذج HTML للمنتج
     */
    generateProductForm(product = null) {
        const isEdit = !!product;
        
        return `
            <div class="product-form">
                <form id="${isEdit ? 'editProductForm' : 'addProductForm'}">
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="productName">اسم المنتج *</label>
                            <input type="text" id="productName" class="form-control" 
                                   value="${product?.name || ''}" required>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label for="productPrice">السعر (د.أ) *</label>
                            <input type="number" id="productPrice" class="form-control" 
                                   step="0.01" min="0" value="${product?.price || ''}" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="productCategory">التصنيف</label>
                            <select id="productCategory" class="form-control">
                                <option value="">اختر تصنيفاً</option>
                                <option value="samah_silk" ${product?.category === 'samah_silk' ? 'selected' : ''}>
                                    جرابات حرير
                                </option>
                                <option value="tuka_silk" ${product?.category === 'tuka_silk' ? 'selected' : ''}>
                                    شالات حرير
                                </option>
                                <option value="samah_cotton" ${product?.category === 'samah_cotton' ? 'selected' : ''}>
                                    جرابات قطن
                                </option>
                            </select>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label for="productStore">المتجر *</label>
                            <select id="productStore" class="form-control" required>
                                <option value="">اختر متجراً</option>
                                <option value="samah" ${product?.store === 'samah' ? 'selected' : ''}>
                                    متجر السماح
                                </option>
                                <option value="tuka" ${product?.store === 'tuka' ? 'selected' : ''}>
                                    متجر التقى
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="productStock">المخزون *</label>
                            <input type="number" id="productStock" class="form-control" 
                                   min="0" value="${product?.stock || 0}" required>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label for="productSKU">رمز المنتج (SKU)</label>
                            <input type="text" id="productSKU" class="form-control" 
                                   value="${product?.sku || ''}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="productDescription">وصف المنتج</label>
                        <textarea id="productDescription" class="form-control" rows="3">${product?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="cancelProductForm()">
                            إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'تحديث المنتج' : 'إضافة المنتج'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
}

// إنشاء نسخة من مدير المنتجات
const productsManager = new ProductsManager();

// تصدير الدوال للاستخدام العام
window.productsManager = productsManager;
window.loadAllProducts = () => productsManager.loadAllProducts();