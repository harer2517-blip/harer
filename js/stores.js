/**
 * Stores Page JavaScript
 * صفحة اختيار المتجر - النسخة المحسنة
 */

// بيانات المتاجر مع التصنيفات الثابتة
const storesData = {
    tuka: {
        name: 'التقى',
        icon: 'fas fa-hands-praying',
        description: 'متجر متخصص في أطقم الصلاة الفاخرة المصنوعة من أفضل أنواع الحرير والقطن، يجمع بين الجمال الروحي والأناقة.',
        stats: {
            categories: 5,
            products: 50,
            rating: 4.9
        },
        categories: [
            { id: 'tuka_silk', name: 'شالات حرير', icon: 'fas fa-scarf', description: 'شالات صلاة مصنوعة من أجود أنواع الحرير الطبيعي' },
            { id: 'tuka_chiffon', name: 'شالات شيفون', icon: 'fas fa-pray', description: 'شالات خفيفة الوزن تناسب جميع الفصول' },
            { id: 'tuka_crepe', name: 'شالات كريب', icon: 'fas fa-star-of-david', description: 'شالات بملمس ناعم ومظهر أنيق' },
            { id: 'tuka_jersey', name: 'شالات جيرسي', icon: 'fas fa-hands', description: 'شالات مريحة وسهلة الارتداء' },
            { id: 'tuka_wool', name: 'شالات صوف', icon: 'fas fa-snowflake', description: 'شالات دافئة لفصل الشتاء' }
        ],
        featured: ['شالات حرير', 'شالات شيفون', 'شالات كريب']
    },
    samah: {
        name: 'السماح',
        icon: 'fas fa-star-and-crescent',
        description: 'وجهتك المثالية للحجاب الفاخر والأناقة الإسلامية، نقدم أحدث صيحات الموضة مع الحفاظ على الهوية الإسلامية الأصيلة.',
        stats: {
            categories: 8,
            products: 80,
            rating: 4.8
        },
        categories: [
            { id: 'samah_silk', name: 'جرابات حرير', icon: 'fas fa-hijab', description: 'حجاب مصنوع من الحرير الفاخر' },
            { id: 'samah_cotton', name: 'جرابات قطن', icon: 'fas fa-tshirt', description: 'حجاب قطني مريح للارتداء اليومي' },
            { id: 'samah_velvet', name: 'جرابات مخمل', icon: 'fas fa-crown', description: 'حجاب بملمس مخملي فاخر' },
            { id: 'samah_embroidery', name: 'جرابات مطرزة', icon: 'fas fa-pen-nib', description: 'حجاب مزين بتطريزات يدوية فاخرة' },
            { id: 'samah_print', name: 'جرابات مطبوعة', icon: 'fas fa-paint-brush', description: 'حجاب بأنماط وألوان مميزة' },
            { id: 'samah_lace', name: 'جرابات دانتيل', icon: 'fas fa-lace', description: 'حجاب بتفاصيل دانتيل أنيقة' },
            { id: 'samah_premium', name: 'جرابات فاخرة', icon: 'fas fa-gem', description: 'مجموعة خاصة من الحجاب الفاخر' },
            { id: 'samah_travel', name: 'جرابات سفر', icon: 'fas fa-suitcase-rolling', description: 'حجاب عملي ومريح للسفر' }
        ],
        featured: ['جرابات حرير', 'جرابات قطن', 'جرابات مخمل']
    }
};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

/**
 * تهيئة الصفحة
 */
function initializePage() {
    // إخفاء صفحة التحميل
    hidePageLoader();
    
    // إعداد السلة
    setupCart();
    
    // إعداد النافبار
    setupNavbar();
    
    // إعداد زر العودة للأعلى
    setupBackToTop();
    
    // إعداد أحداث المتاجر
    setupStoreEvents();
    
    // إعداد روابط السلة
    setupCartLinks();
    
    console.log('✅ تم تحميل صفحة المتاجر بنجاح');
}

/**
 * إخفاء صفحة التحميل
 */
function hidePageLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 500);
    }
}

/**
 * إعداد السلة
 */
function setupCart() {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    updateCartCounter(cart);
}

/**
 * تحديث عداد السلة
 */
function updateCartCounter(cart) {
    const counter = document.getElementById('cartCount');
    if (!counter) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        counter.textContent = totalItems > 99 ? '99+' : totalItems;
        counter.style.display = 'flex';
    } else {
        counter.style.display = 'none';
    }
}

/**
 * إعداد النافبار
 */
function setupNavbar() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;
    
    // تأثير التمرير
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // تحديث الروابط النشطة
    updateActiveNavLink();
}

/**
 * تحديث الروابط النشطة في النافبار
 */
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (href.includes('stores') && currentPage.includes('stores'))) {
            link.classList.add('active');
        }
    });
}

/**
 * إعداد زر العودة للأعلى
 */
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * إعداد أحداث المتاجر
 */
function setupStoreEvents() {
    const storeCards = document.querySelectorAll('.store-card');
    
    storeCards.forEach(card => {
        // تأثيرات المرور بالفأرة
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
        
        // النقر على بطاقة المتجر
        card.addEventListener('click', function(e) {
            // منع الانتقال إذا كان النقر على زر
            if (e.target.closest('.store-btn')) return;
            
            const store = this.getAttribute('data-store');
            navigateToStore(store);
        });
        
        // تأثيرات الأزرار داخل البطاقة
        const buttons = card.querySelectorAll('.store-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    });
}

/**
 * الانتقال إلى متجر معين
 */
function navigateToStore(store) {
    const storeData = storesData[store];
    if (!storeData) return;
    
    // إظهار رسالة تحميل
    showStoreLoading(storeData.name);
    
    // الانتقال بعد تأخير بسيط
    setTimeout(() => {
        window.location.href = `categories.html?store=${store}`;
    }, 800);
}

/**
 * إظهار رسالة تحميل المتجر
 */
function showStoreLoading(storeName) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'store-loading-overlay';
    loadingDiv.innerHTML = `
        <div class="store-loading-content">
            <div class="loading-spinner"></div>
            <h4>جاري الانتقال إلى متجر ${storeName}</h4>
            <p>يرجى الانتظار...</p>
        </div>
    `;
    
    // إضافة الأنماط إذا لم تكن موجودة
    if (!document.getElementById('store-loading-styles')) {
        const styles = document.createElement('style');
        styles.id = 'store-loading-styles';
        styles.textContent = `
            .store-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            .store-loading-content {
                text-align: center;
                background: white;
                padding: 3rem;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                animation: slideUp 0.5s ease;
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(loadingDiv);
}

/**
 * إعداد روابط السلة
 */
function setupCartLinks() {
    const cartLink = document.getElementById('cartLink');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            showCartNotification();
        });
    }
}

/**
 * إظهار إشعار السلة
 */
function showCartNotification() {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let message = 'السلة فارغة';
    let type = 'info';
    
    if (totalItems > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message = `لديك ${totalItems} منتج في السلة - المجموع: ${totalPrice.toFixed(2)} د.أ`;
        type = 'success';
    }
    
    showNotification(message, type);
}

/**
 * إظهار إشعار عام
 */
function showNotification(message, type = 'info') {
    // إزالة أي إشعارات سابقة
    const existingNotification = document.querySelector('.global-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `global-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // إضافة الأنماط إذا لم تكن موجودة
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .global-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 10px;
                padding: 1rem 1.5rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                border-right: 4px solid;
                max-width: 400px;
            }
            
            .notification-success {
                border-color: #2ecc71;
                background: #d5f4e6;
            }
            
            .notification-info {
                border-color: #3498db;
                background: #d6eaf8;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .notification-content i:first-child {
                font-size: 1.2rem;
            }
            
            .notification-success i:first-child { color: #2ecc71; }
            .notification-info i:first-child { color: #3498db; }
            
            .notification-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                margin-right: auto;
                padding: 0.25rem;
                border-radius: 4px;
            }
            
            .notification-close:hover {
                background: rgba(0,0,0,0.05);
                color: #333;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // إضافة حدث الإغلاق
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    // إزالة تلقائية بعد 5 ثوانٍ
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

/**
 * الحصول على أيقونة الإشعار المناسبة
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

// جعل الدوال متاحة عالمياً للاستخدام
window.navigateToStore = navigateToStore;
window.showNotification = showNotification;