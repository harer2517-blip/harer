/**
 * Main JavaScript File
 * Basic functionality for all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initPageLoader();
    initNavbar();
    initCart();
    initBackToTop();
    initNotifications();
    
    console.log('✅ Page loaded successfully');
});

/**
 * Initialize Page Loader
 */
function initPageLoader() {
    const pageLoader = document.querySelector('.page-loader');
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.style.opacity = '0';
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 500);
        }, 500);
    }
}

/**
 * Initialize Navbar
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Update active link based on current page
    updateActiveNavLink();
}

/**
 * Update active navigation link
 */
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') ||
            (currentPage.includes('stores') && href.includes('stores')) ||
            (currentPage.includes('products') && href.includes('products'))) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize Cart
 */
function initCart() {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    updateCartCount(cart);
    
    // Cart button click event
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCartNotification();
        });
    }
}

/**
 * Update cart count
 */
function updateCartCount(cart) {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
        cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

/**
 * Show cart notification
 */
function showCartNotification() {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let message = '🛒 السلة فارغة';
    let type = 'info';
    
    if (totalItems > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message = `🛒 لديك ${totalItems} منتج في السلة - المجموع: ${totalPrice.toFixed(2)} د.أ`;
        type = 'success';
    }
    
    showNotification(message, type);
}

/**
 * Initialize Back to Top Button
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    // Show/hide button on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Initialize Notifications System
 */
function initNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        addNotificationStyles();
    }
    
    // Add to container
    const container = document.querySelector('.notifications-container') || document.body;
    container.appendChild(notification);
    
    // Add close event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            removeNotification(notification);
        }
    }, duration);
    
    return notification;
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
}

/**
 * Remove notification with animation
 */
function removeNotification(notification) {
    notification.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Add notification styles
 */
function addNotificationStyles() {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notifications-container {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        }
        
        .notification {
            background: white;
            border-radius: var(--border-radius-md);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease;
            border-right: 4px solid;
            position: relative;
            overflow: hidden;
        }
        
        .notification::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: currentColor;
            opacity: 0.1;
            z-index: 0;
        }
        
        .notification-success {
            border-color: #2ecc71;
            color: #2ecc71;
        }
        
        .notification-error {
            border-color: #e74c3c;
            color: #e74c3c;
        }
        
        .notification-warning {
            border-color: #f39c12;
            color: #f39c12;
        }
        
        .notification-info {
            border-color: var(--primary-color);
            color: var(--primary-color);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
            z-index: 1;
        }
        
        .notification-content i:first-child {
            font-size: 1.2rem;
        }
        
        .notification-content span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: currentColor;
            opacity: 0.7;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
            transition: var(--transition-fast);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            opacity: 1;
            background: rgba(0,0,0,0.05);
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(-100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-100%);
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Add product to cart
 */
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex > -1) {
        // Update quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            store: product.store,
            addedAt: new Date().toISOString()
        });
    }
    
    // Save to localStorage
    localStorage.setItem('harir_cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount(cart);
    
    // Show success notification
    showNotification(`تم إضافة "${product.name}" إلى السلة`, 'success');
    
    return cart;
}

/**
 * Remove product from cart
 */
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('harir_cart', JSON.stringify(cart));
    updateCartCount(cart);
    
    showNotification('تم إزالة المنتج من السلة', 'success');
    
    return cart;
}

/**
 * Update cart item quantity
 */
function updateCartItemQuantity(productId, quantity) {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        
        if (quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    
    localStorage.setItem('harir_cart', JSON.stringify(cart));
    updateCartCount(cart);
    
    return cart;
}

/**
 * Get cart total price
 */
function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('harir_cart') || '[]');
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Clear entire cart
 */
function clearCart() {
    localStorage.removeItem('harir_cart');
    updateCartCount([]);
    showNotification('تم تفريغ السلة', 'success');
}

/**
 * Add to cart button click handler
 */
window.addToCart = function(product) {
    const cart = addToCart(product);
    console.log('Cart updated:', cart);
};

/**
 * Helper function to get URL parameters
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        store: params.get('store'),
        category: params.get('category')
    };
}

// أضف console.log للتحقق
const urlParams = getUrlParams();
console.log('🔗 معاملات URL:', urlParams);
/**
 * Helper function to update URL without page reload
 */
function updateUrl(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.pushState({}, '', url);
}

/**
 * Format price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(price);
}

/**
 * Format date
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Export functions for use in other files
window.showNotification = showNotification;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.getUrlParams = getUrlParams;
window.updateUrl = updateUrl;