/**
 * Categories Management Module
 */

class CategoriesManager {
    constructor() {
        this.db = window.appState?.firebase?.db;
        this.categories = [];
    }

    /**
     * تحميل جميع التصنيفات
     */
    async loadAllCategories() {
        try {
            if (!this.db) {
                console.warn('⚠️ Firebase غير متصل، استخدام بيانات وهمية');
                return this.loadMockCategories();
            }

            const snapshot = await this.db.collection('categories').get();
            this.categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return this.categories;
        } catch (error) {
            console.error('❌ خطأ في تحميل التصنيفات:', error);
            return this.loadMockCategories();
        }
    }

    /**
     * تحميل تصنيفات متجر محدد
     */
    async loadStoreCategories(store) {
        try {
            if (!this.db) {
                return this.loadMockCategories().filter(c => c.store === store);
            }

            const snapshot = await this.db.collection('categories')
                .where('store', '==', store)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`❌ خطأ في تحميل تصنيفات ${store}:`, error);
            return [];
        }
    }

    /**
     * إضافة تصنيف جديد
     */
    async addCategory(categoryData) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            const categoryRef = await this.db.collection('categories').add({
                ...categoryData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: window.appState?.user?.uid,
                productCount: 0
            });

            return categoryRef.id;
        } catch (error) {
            console.error('❌ خطأ في إضافة التصنيف:', error);
            throw error;
        }
    }

    /**
     * تحديث تصنيف
     */
    async updateCategory(categoryId, categoryData) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            await this.db.collection('categories').doc(categoryId).update({
                ...categoryData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('❌ خطأ في تحديث التصنيف:', error);
            throw error;
        }
    }

    /**
     * حذف تصنيف
     */
    async deleteCategory(categoryId) {
        try {
            if (!this.db) {
                throw new Error('Firebase غير متصل');
            }

            // التحقق من وجود منتجات في هذا التصنيف
            const productsSnapshot = await this.db.collection('products')
                .where('category', '==', categoryId)
                .get();
            
            if (productsSnapshot.size > 0) {
                throw new Error('لا يمكن حذف التصنيف لأنه يحتوي على منتجات');
            }

            await this.db.collection('categories').doc(categoryId).delete();
            return true;
        } catch (error) {
            console.error('❌ خطأ في حذف التصنيف:', error);
            throw error;
        }
    }

    /**
     * تحديث عدد المنتجات في التصنيف
     */
    async updateProductCount(categoryId) {
        try {
            if (!this.db) return;

            const snapshot = await this.db.collection('products')
                .where('category', '==', categoryId)
                .get();
            
            await this.db.collection('categories').doc(categoryId).update({
                productCount: snapshot.size,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('❌ خطأ في تحديث عدد المنتجات:', error);
        }
    }

    /**
     * بيانات وهمية للعرض
     */
    loadMockCategories() {
        return [
            {
                id: 'samah_silk',
                name: 'جرابات حرير',
                description: 'جرابات مصنوعة من الحرير الفاخر',
                store: 'samah',
                productCount: 15,
                color: '#667eea',
                icon: 'fas fa-tshirt',
                createdAt: '2024-01-01'
            },
            {
                id: 'tuka_silk',
                name: 'شالات حرير',
                description: 'شالات أنيقة من الحرير الخالص',
                store: 'tuka',
                productCount: 8,
                color: '#f093fb',
                icon: 'fas fa-scarf',
                createdAt: '2024-01-02'
            },
            {
                id: 'samah_cotton',
                name: 'جرابات قطن',
                description: 'جرابات مريحة من القطن المصري',
                store: 'samah',
                productCount: 25,
                color: '#4facfe',
                icon: 'fas fa-shirt',
                createdAt: '2024-01-03'
            },
            {
                id: 'tuka_cotton',
                name: 'شالات قطن',
                description: 'شالات من القطن الناعم',
                store: 'tuka',
                productCount: 12,
                color: '#43e97b',
                icon: 'fas fa-scarf',
                createdAt: '2024-01-04'
            }
        ];
    }

    /**
     * توليد نموذج HTML للتصنيف
     */
    generateCategoryForm(category = null) {
        const isEdit = !!category;
        
        return `
            <div class="category-form">
                <form id="${isEdit ? 'editCategoryForm' : 'addCategoryForm'}">
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="categoryName">اسم التصنيف *</label>
                            <input type="text" id="categoryName" class="form-control" 
                                   value="${category?.name || ''}" required>
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label for="categoryStore">المتجر *</label>
                            <select id="categoryStore" class="form-control" required>
                                <option value="">اختر متجراً</option>
                                <option value="samah" ${category?.store === 'samah' ? 'selected' : ''}>
                                    متجر السماح
                                </option>
                                <option value="tuka" ${category?.store === 'tuka' ? 'selected' : ''}>
                                    متجر التقى
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="categoryDescription">وصف التصنيف</label>
                        <textarea id="categoryDescription" class="form-control" rows="3">${category?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="categoryColor">لون التصنيف</label>
                            <input type="color" id="categoryColor" class="form-control" 
                                   value="${category?.color || '#667eea'}">
                        </div>
                        
                        <div class="form-group col-md-6">
                            <label for="categoryIcon">أيقونة التصنيف</label>
                            <select id="categoryIcon" class="form-control">
                                <option value="fas fa-tshirt" ${category?.icon === 'fas fa-tshirt' ? 'selected' : ''}>
                                    تيشرت
                                </option>
                                <option value="fas fa-shirt" ${category?.icon === 'fas fa-shirt' ? 'selected' : ''}>
                                    قميص
                                </option>
                                <option value="fas fa-scarf" ${category?.icon === 'fas fa-scarf' ? 'selected' : ''}>
                                    شال
                                </option>
                                <option value="fas fa-socks" ${category?.icon === 'fas fa-socks' ? 'selected' : ''}>
                                    جوارب
                                </option>
                                <option value="fas fa-hat-cowboy" ${category?.icon === 'fas fa-hat-cowboy' ? 'selected' : ''}>
                                    قبعة
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="cancelCategoryForm()">
                            إلغاء
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? 'تحديث التصنيف' : 'إضافة التصنيف'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    /**
     * توليد HTML لعرض التصنيفات
     */
    generateCategoriesHTML(categories) {
        return categories.map(category => `
            <div class="col-md-4 mb-3">
                <div class="category-card p-3 border rounded" style="border-left: 4px solid ${category.color || '#667eea'}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="mb-0">
                                <i class="${category.icon || 'fas fa-tag'} me-2"></i>
                                ${category.name}
                            </h5>
                            <small class="text-muted">${category.store === 'samah' ? 'متجر السماح' : 'متجر التقى'}</small>
                        </div>
                        <span class="badge bg-light text-dark">
                            <i class="fas fa-box"></i> ${category.productCount || 0}
                        </span>
                    </div>
                    
                    <p class="text-muted small mb-2">${category.description || 'لا يوجد وصف'}</p>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-calendar"></i> ${this.formatDate(category.createdAt)}
                        </small>
                        <div>
                            <button class="btn btn-sm btn-outline" onclick="editCategory('${category.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${category.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * تنسيق التاريخ
     */
    formatDate(dateString) {
        if (!dateString) return 'غير معروف';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG');
    }
}

// إنشاء نسخة من مدير التصنيفات
const categoriesManager = new CategoriesManager();

// تصدير الدوال للاستخدام العام
window.categoriesManager = categoriesManager;
window.loadAllCategories = () => categoriesManager.loadAllCategories();