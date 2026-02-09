/**
 * Categories Page JavaScript
 * عرض التصنيفات حسب المتجر المحدد
 */

// بيانات التصنيفات الثابتة مع الألوان الجديدة
const categoriesData = {
    samah: {
        name: 'السماح',
        icon: 'fas fa-star-and-crescent',
        description: 'متجر متخصص في الحجاب الفاخر والأناقة الإسلامية، يجمع بين الأصالة والموضة',
        color: '#571c24',
        bgColor: 'linear-gradient(135deg, #571c24, #571c24)',
        categories: [
            {
                id: 'samah_silk',
                name: 'جرابات حرير',
                icon: 'fas fa-scarf',
                description: 'جرابات مصنوعة من أجود أنواع الحرير الطبيعي، تتميز بالنعومة واللمعة الفاخرة',
                count: 15,
                features: ['حرير طبيعي 100%', 'ألوان متعددة', 'تصميم مريح'],
                image: 'https://images.unsplash.com/photo-1589820309621-7c7557a76870?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_cotton',
                name: 'جرابات قطن',
                icon: 'fas fa-tshirt',
                description: 'جرابات قطنية مريحة للارتداء اليومي، تناسب جميع الفصول',
                count: 20,
                features: ['قطن مصري عالي الجودة', 'تنفس جيد', 'سهلة الغسيل'],
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_velvet',
                name: 'جرابات مخمل',
                icon: 'fas fa-crown',
                description: 'جرابات بملمس مخملي فاخر، مثالية للمناسبات الخاصة',
                count: 8,
                features: ['مخمل عالي الجودة', 'ملمس ناعم', 'أناقة فاخرة'],
                image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_embroidery',
                name: 'جرابات مطرزة',
                icon: 'fas fa-pen-nib',
                description: 'جرابات مزينة بتطريزات يدوية فاخرة تعكس الأناقة الشرقية',
                count: 12,
                features: ['تطريز يدوي', 'تفاصيل فاخرة', 'تصاميم حصرية'],
                image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_print',
                name: 'جرابات مطبوعة',
                icon: 'fas fa-paint-brush',
                description: 'جرابات بأنماط وألوان مميزة تعبر عن شخصية مرتديه',
                count: 10,
                features: ['طباعة عالية الجودة', 'ألوان ثابتة', 'تصاميم متنوعة'],
                image: 'https://images.unsplash.com/photo-1581404917879-53e19259fdda?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_lace',
                name: 'جرابات دانتيل',
                icon: 'fas fa-lace',
                description: 'جرابات بتفاصيل دانتيل أنيقة تجمع بين الكلاسيكية والحديث',
                count: 6,
                features: ['تفاصيل دانتيل', 'أناقة عصرية', 'خفة الوزن'],
                image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_premium',
                name: 'جرابات فاخرة',
                icon: 'fas fa-gem',
                description: 'مجموعة خاصة من الجرابات الفاخرة المصممة بأعلى معايير الجودة',
                count: 5,
                features: ['مواد فاخرة', 'تصميم حصري', 'جودة استثنائية'],
                image: 'https://images.unsplash.com/photo-1558769132-cb1cb458edcb?w=400&h=300&fit=crop'
            },
            {
                id: 'samah_travel',
                name: 'جرابات سفر',
                icon: 'fas fa-suitcase-rolling',
                description: 'جرابات عمليلة ومريحة للسفر، سهلة الطي والتنظيم',
                count: 4,
                features: ['سهلة الطي', 'مقاومة للتجاعيد', 'تناسب السفر'],
                image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop'
            }
        ]
    },
    tuka: {
        name: 'التقى',
        icon: 'fas fa-hands-praying',
        description: 'متجر متخصص في أطقم الصلاة الفاخرة، يجمع بين الجمال الروحي والأناقة',
        color: '#571c24',
        bgColor: 'linear-gradient(135deg, #69212B, #571c24)',
        categories: [
            {
                id: 'tuka_silk',
                name: 'شالات حرير',
                icon: 'fas fa-scarf',
                description: 'شالات صلاة مصنوعة من أجود أنواع الحرير الطبيعي، أنيقة وفاخرة',
                count: 12,
                features: ['حرير طبيعي', 'خفة الوزن', 'أناقة فاخرة'],
                image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop'
            },
            {
                id: 'tuka_chiffon',
                name: 'شالات شيفون',
                icon: 'fas fa-pray',
                description: 'شالات خفيفة الوزن تناسب جميع الفصول، بملمس ناعم وشفافية أنيقة',
                count: 8,
                features: ['خفة الوزن', 'تنفس جيد', 'ألوان متنوعة'],
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop'
            },
            {
                id: 'tuka_crepe',
                name: 'شالات كريب',
                icon: 'fas fa-star-of-david',
                description: 'شالات بملمس كريب ناعم ومظهر أنيق، مثالية للصلاة اليومية',
                count: 10,
                features: ['ملمس كريب ناعم', 'راحة في الارتداء', 'تصميم عملي'],
                image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=400&h=300&fit=crop'
            },
            {
                id: 'tuka_jersey',
                name: 'شالات جيرسي',
                icon: 'fas fa-hands',
                description: 'شالات مريحة وسهلة الارتداء، مصنوعة من قماش جيرسي عالي الجودة',
                count: 6,
                features: ['قماش جيرسي', 'مرونة عالية', 'راحة مطلقة'],
                image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop'
            },
            {
                id: 'tuka_wool',
                name: 'شالات صوف',
                icon: 'fas fa-snowflake',
                description: 'شالات دافئة لفصل الشتاء، مصنوعة من صوف طبيعي عالي الجودة',
                count: 4,
                features: ['صوف طبيعي', 'دفء استثنائي', 'مقاوم للبرد'],
                image: 'https://images.unsplash.com/photo-1558769132-cb1cb458edcb?w=400&h=300&fit=crop'
            }
        ]
    }
};

// المتغيرات
let currentStore = null;

document.addEventListener('DOMContentLoaded', function() {
    initCategoriesPage();
});

/**
 * تهيئة صفحة التصنيفات
 */
function initCategoriesPage() {
    // الحصول على المتجر من رابط URL
    currentStore = getStoreFromURL();
    
    if (currentStore) {
        // إظهار معلومات المتجر
        showStoreInfo(currentStore);
        
        // عرض التصنيفات
        showCategories(currentStore);
    } else {
        // إظهار رسالة اختيار متجر
        showNoStoreMessage();
    }
    
    // إعداد الأحداث
    setupEvents();
    
    // إضافة الأنماط الخاصة
    addStoreSpecificStyles();
    
    console.log('✅ Categories page initialized');
}

/**
 * الحصول على المتجر من رابط URL
 */
function getStoreFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const store = urlParams.get('store');
    
    // التحقق من صحة اسم المتجر
    if (store && categoriesData[store]) {
        return store;
    }
    
    return null;
}

/**
 * إظهار معلومات المتجر
 */
function showStoreInfo(store) {
    const storeData = categoriesData[store];
    if (!storeData) return;
    
    // تحديث العنوان
    document.getElementById('storeTitle').textContent = `تصنيفات ${storeData.name}`;
    document.getElementById('storeSubtitle').textContent = storeData.description;
    
    // تحديث شريط التصفح
    document.getElementById('storeBreadcrumb').innerHTML = `
        <a href="stores.html">المتاجر</a>
    `;
    document.getElementById('currentStoreName').textContent = storeData.name;
    document.getElementById('storeDivider').style.display = 'inline';
    
    // إظهار إجراءات المتجر
    document.getElementById('storeActions').style.display = 'flex';
    
    // تحديث زر عرض جميع المنتجات
    const viewAllBtn = document.getElementById('viewAllProductsBtn');
    if (viewAllBtn) {
        viewAllBtn.href = `products.html?store=${store}`;
    }
    
    // إظهار بطاقة معلومات المتجر
    const storeInfoCard = document.getElementById('storeInfoCard');
    if (storeInfoCard) {
        document.getElementById('storeIcon').innerHTML = `<i class="${storeData.icon}"></i>`;
        document.getElementById('storeNameDisplay').textContent = storeData.name;
        document.getElementById('storeDescription').textContent = storeData.description;
        storeInfoCard.style.display = 'block';
        storeInfoCard.style.background = storeData.bgColor;
    }
}

/**
 * عرض التصنيفات
 */
function showCategories(store) {
    const storeData = categoriesData[store];
    if (!storeData) return;
    
    // إخفاء رسالة عدم وجود متجر
    document.getElementById('noStoreMessage').style.display = 'none';
    
    // إظهار مؤشر التحميل
    showLoading(true);
    
    // إنشاء HTML للتصنيفات
    setTimeout(() => {
        const categoriesContainer = document.getElementById('categoriesContainer');
        if (!categoriesContainer) return;
        
        if (!storeData.categories || storeData.categories.length === 0) {
            showNoCategoriesMessage();
            return;
        }
        
        let categoriesHTML = '';
        
        storeData.categories.forEach(category => {
            categoriesHTML += createCategoryCardHTML(category, store);
        });
        
        categoriesContainer.innerHTML = categoriesHTML;
        
        // إضافة تأثيرات الظهور
        animateCategories();
        
        // إخفاء مؤشر التحميل
        showLoading(false);
    }, 500);
}

/**
 * إنشاء بطاقة تصنيف HTML
 */
function createCategoryCardHTML(category, store) {
    const featuresHTML = category.features.map(feature => `
        <li>
            <i class="fas fa-check-circle"></i>
            ${feature}
        </li>
    `).join('');
    
    return `
        <div class="category-card ${store}" data-category="${category.id}">
            <div class="category-header">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-title">
                    <h3>${category.name}</h3>
                    <div class="category-count">
                        <i class="fas fa-box"></i>
                        <span>${category.count} منتج</span>
                    </div>
                </div>
            </div>
            
            <div class="category-body">
                <p class="category-description">${category.description}</p>
                
                <div class="category-features">
                    <h5>المميزات:</h5>
                    <ul class="features-list">
                        ${featuresHTML}
                    </ul>
                </div>
            </div>
            
            <div class="category-footer">
                <a href="products.html?store=${store}&category=${category.id}" 
                   class="btn btn-primary category-btn">
                    <i class="fas fa-eye me-2"></i>
                    عرض المنتجات
                </a>
            </div>
        </div>
    `;
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
 * إظهار رسالة عدم وجود متجر
 */
function showNoStoreMessage() {
    document.getElementById('noStoreMessage').style.display = 'block';
    document.getElementById('categoriesContainer').innerHTML = '';
    showLoading(false);
}

/**
 * إظهار رسالة عدم وجود تصنيفات
 */
function showNoCategoriesMessage() {
    document.getElementById('noCategoriesMessage').style.display = 'block';
    document.getElementById('categoriesContainer').innerHTML = '';
}

/**
 * إظهار/إخفاء مؤشر التحميل
 */
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (categoriesContainer) {
        categoriesContainer.style.display = show ? 'none' : 'grid';
    }
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
            // تأثير النقر
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
                showNotification(`جاري تحميل منتجات ${categoriesData[currentStore].name}...`, 'info');
                setTimeout(() => {
                    window.location.href = `products.html?store=${currentStore}`;
                }, 500);
            }
        });
    }
}

/**
 * إضافة أنماط خاصة بكل متجر
 */
function addStoreSpecificStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* ألوان وتنسيقات خاصة بكل متجر */
        .category-card.samah .btn-primary {
            background: linear-gradient(135deg, #571c24, #571c24);
            border-color: #571c24;
        }
        
        .category-card.samah .btn-primary:hover {
            background: linear-gradient(135deg, #571c24, #571c24);
        }
        
        .category-card.tuka .btn-primary {
            background: linear-gradient(135deg, #571c24, #571c24);
            border-color: #571c24;
        }
        
        .category-card.tuka .btn-primary:hover {
            background: linear-gradient(135deg, #571c24, #571c24);
        }
        
        /* توهج عند التحويم */
        .category-card.samah:hover {
            box-shadow: 0 15px 40px rgba(139, 0, 0, 0.25);
        }
        
        .category-card.tuka:hover {
            box-shadow: 0 15px 40px rgba(139, 0, 0, 0.25);
        }
        
        /* لون الحد العلوي */
        .category-card.samah {
            border-top-color: #571c24;
        }
        
        .category-card.tuka {
            border-top-color: #571c24;
        }
        
        /* أيقونات البطاقات */
        .category-card.samah .category-icon {
            background: linear-gradient(135deg, #571c24, #571c24);
        }
        
        .category-card.tuka .category-icon {
            background: linear-gradient(135deg, #571c24, #571c24);
        }
    `;
    document.head.appendChild(style);
}

// جعل الدوال متاحة عالمياً
window.navigateToCategory = function(categoryId) {
    if (!currentStore) return;
    
    const storeData = categoriesData[currentStore];
    const category = storeData.categories.find(cat => cat.id === categoryId);
    
    if (category) {
        showNotification(`جاري تحميل ${category.name}...`, 'info');
        setTimeout(() => {
            window.location.href = `products.html?store=${currentStore}&category=${categoryId}`;
        }, 500);
    }
};