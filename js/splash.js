/**
 * Splash Page Script - Simplified Version
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 صفحة الترحيب جاهزة');
    
    // تهيئة العد التنازلي
    startCountdown();
    
    // تهيئة الجسيمات (اختياري - تم تعطيلها)
    // initParticles();
    
    // إضافة مستمعات الأحداث
    setupEventListeners();
    
    // تحسين أداء الصور
    optimizeImages();
});

// تهيئة العد التنازلي
function startCountdown() {
    let countdown = 10; // 10 ثواني
    const countdownElement = document.getElementById('countdown');
    const visitButton = document.getElementById('visitButton');
    
    if (!countdownElement || !visitButton) return;
    
    const countdownInterval = setInterval(function() {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            window.location.href = visitButton.href;
        }
        
        // تغيير اللون عند اقتراب النهاية
        if (countdown <= 3) {
            countdownElement.style.color = '#dc3545';
            countdownElement.style.animation = 'pulse 0.5s infinite alternate';
        }
    }, 1000);
}

// تهيئة الجسيمات (معلقة حالياً)
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    // يمكنك إضافة جسيمات بسيطة هنا إذا أردت
    // لكن طلبت إزالة التأثيرات المعقدة
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
    // الزر الرئيسي
    const visitButton = document.getElementById('visitButton');
    if (visitButton) {
        visitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // تأثير نقر بسيط
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
                window.location.href = this.href;
            }, 150);
        });
    }
    
    // تأثيرات hover بسيطة
    setupHoverEffects();
}

// تأثيرات hover
function setupHoverEffects() {
    // تأثير hover بسيط على الأيقونات الاجتماعية
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// تحسين أداء الصور
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // تحسين التحميل المتأخر
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        
        // تعيين alt إذا لم يكن موجوداً
        if (!img.alt) {
            img.alt = 'صورة متجر حرير';
        }
    });
}

// تأثير ظهور تدريجي للعناصر
function fadeInElements() {
    const elements = document.querySelectorAll('.fade-in-element');
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// التوجيه الفوري (للتجربة)
function skipSplash() {
    window.location.href = 'stores.html';
}

// أدوات التصحيح
window.splashDebug = {
    skip: skipSplash,
    reload: () => location.reload(),
    getCountdown: () => document.getElementById('countdown')?.textContent
};

// تنفيذ التأثيرات بعد تحميل الصفحة
setTimeout(() => {
    fadeInElements();
}, 500);

console.log('🎨 التصميم المبسط جاهز');