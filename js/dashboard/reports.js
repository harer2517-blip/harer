/**
 * Reports and Analytics Module
 */

class ReportsManager {
    constructor() {
        this.db = window.appState?.firebase?.db;
        this.charts = {};
    }

    /**
     * تحميل بيانات التقارير
     */
    async loadReports() {
        try {
            return {
                salesData: await this.getSalesData(),
                productsData: await this.getProductsData(),
                ordersData: await this.getOrdersData(),
                revenueData: await this.getRevenueData()
            };
        } catch (error) {
            console.error('❌ خطأ في تحميل التقارير:', error);
            return this.getMockReportsData();
        }
    }

    /**
     * الحصول على بيانات المبيعات
     */
    async getSalesData() {
        try {
            if (!this.db) {
                return this.getMockSalesData();
            }

            // الحصول على الطلبات المكتملة في آخر 30 يوم
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const snapshot = await this.db.collection('orders')
                .where('status', '==', 'completed')
                .where('createdAt', '>=', thirtyDaysAgo)
                .get();
            
            const orders = snapshot.docs.map(doc => doc.data());
            
            // تحليل البيانات
            const dailySales = {};
            orders.forEach(order => {
                const date = new Date(order.createdAt?.toDate()).toLocaleDateString('ar-EG');
                dailySales[date] = (dailySales[date] || 0) + (order.total || 0);
            });
            
            return {
                labels: Object.keys(dailySales),
                data: Object.values(dailySales),
                total: Object.values(dailySales).reduce((a, b) => a + b, 0),
                count: orders.length
            };
        } catch (error) {
            console.error('❌ خطأ في الحصول على بيانات المبيعات:', error);
            return this.getMockSalesData();
        }
    }

    /**
     * الحصول على بيانات المنتجات
     */
    async getProductsData() {
        try {
            if (!this.db) {
                return this.getMockProductsData();
            }

            const snapshot = await this.db.collection('products').get();
            const products = snapshot.docs.map(doc => doc.data());
            
            // تحليل البيانات حسب التصنيف
            const categoryData = {};
            products.forEach(product => {
                const category = product.category || 'غير مصنف';
                categoryData[category] = (categoryData[category] || 0) + 1;
            });
            
            return {
                labels: Object.keys(categoryData),
                data: Object.values(categoryData),
                total: products.length
            };
        } catch (error) {
            console.error('❌ خطأ في الحصول على بيانات المنتجات:', error);
            return this.getMockProductsData();
        }
    }

    /**
     * الحصول على بيانات الطلبات
     */
    async getOrdersData() {
        try {
            if (!this.db) {
                return this.getMockOrdersData();
            }

            const snapshot = await this.db.collection('orders').get();
            const orders = snapshot.docs.map(doc => doc.data());
            
            // تحليل البيانات حسب الحالة
            const statusData = {
                pending: 0,
                processing: 0,
                completed: 0,
                cancelled: 0
            };
            
            orders.forEach(order => {
                const status = order.status || 'pending';
                if (statusData.hasOwnProperty(status)) {
                    statusData[status]++;
                }
            });
            
            return {
                labels: ['قيد الانتظار', 'قيد المعالجة', 'مكتملة', 'ملغاة'],
                data: Object.values(statusData),
                total: orders.length
            };
        } catch (error) {
            console.error('❌ خطأ في الحصول على بيانات الطلبات:', error);
            return this.getMockOrdersData();
        }
    }

    /**
     * الحصول على بيانات الإيرادات
     */
    async getRevenueData() {
        try {
            if (!this.db) {
                return this.getMockRevenueData();
            }

            // الحصول على الطلبات المكتملة
            const snapshot = await this.db.collection('orders')
                .where('status', '==', 'completed')
                .get();
            
            const orders = snapshot.docs.map(doc => doc.data());
            
            // تحليل البيانات الشهرية
            const monthlyRevenue = {};
            orders.forEach(order => {
                const date = new Date(order.createdAt?.toDate());
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + (order.total || 0);
            });
            
            // ترتيب الأشهر
            const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
                const [aMonth, aYear] = a.split('/');
                const [bMonth, bYear] = b.split('/');
                return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
            });
            
            return {
                labels: sortedMonths.map(month => this.getMonthName(month)),
                data: sortedMonths.map(month => monthlyRevenue[month]),
                total: Object.values(monthlyRevenue).reduce((a, b) => a + b, 0)
            };
        } catch (error) {
            console.error('❌ خطأ في الحصول على بيانات الإيرادات:', error);
            return this.getMockRevenueData();
        }
    }

    /**
     * الحصول على اسم الشهر
     */
    getMonthName(monthYear) {
        const [month, year] = monthYear.split('/');
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    /**
     * بيانات وهمية للتقارير
     */
    getMockReportsData() {
        return {
            salesData: this.getMockSalesData(),
            productsData: this.getMockProductsData(),
            ordersData: this.getMockOrdersData(),
            revenueData: this.getMockRevenueData()
        };
    }

    getMockSalesData() {
        const labels = [];
        const data = [];
        
        // توليد بيانات لـ 7 أيام
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('ar-EG'));
            data.push(Math.floor(Math.random() * 500) + 100);
        }
        
        return {
            labels,
            data,
            total: data.reduce((a, b) => a + b, 0),
            count: Math.floor(Math.random() * 20) + 10
        };
    }

    getMockProductsData() {
        return {
            labels: ['جرابات حرير', 'شالات حرير', 'جرابات قطن', 'شالات قطن'],
            data: [15, 8, 25, 12],
            total: 60
        };
    }

    getMockOrdersData() {
        return {
            labels: ['قيد الانتظار', 'قيد المعالجة', 'مكتملة', 'ملغاة'],
            data: [3, 2, 12, 1],
            total: 18
        };
    }

    getMockRevenueData() {
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
        const data = months.map(() => Math.floor(Math.random() * 2000) + 1000);
        
        return {
            labels: months,
            data,
            total: data.reduce((a, b) => a + b, 0)
        };
    }

    /**
     * توليد HTML لعرض التقارير
     */
    generateReportsHTML(reportsData) {
        return `
            <div class="reports-page">
                <!-- بطاقات الملخص -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="card border-primary">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">إجمالي الإيرادات</h6>
                                        <h3 class="text-primary">${reportsData.salesData.total.toFixed(2)} د.أ</h3>
                                        <small class="text-muted">آخر 30 يوم</small>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-money-bill-wave fa-2x text-primary"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <div class="card border-success">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h6 class="text-muted">عدد الطلبات</h6>
                                        <h3 class="text-success">${reportsData.ordersData.total}</h3>
                                        <small class="text-muted">إجمالي الطلبات</small>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-shopping-cart fa-2x text-success"></i>
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
                                        <h6 class="text-muted">عدد المنتجات</h6>
                                        <h3 class="text-info">${reportsData.productsData.total}</h3>
                                        <small class="text-muted">منتجات نشطة</small>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-box fa-2x text-info"></i>
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
                                        <h6 class="text-muted">متوسط الطلب</h6>
                                        <h3 class="text-warning">${(reportsData.salesData.total / (reportsData.ordersData.total || 1)).toFixed(2)} د.أ</h3>
                                        <small class="text-muted">متوسط قيمة الطلب</small>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-chart-line fa-2x text-warning"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- المخططات -->
                <div class="row mb-4">
                    <div class="col-md-8 mb-3">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">الإيرادات اليومية</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="salesChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-3">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">حالات الطلبات</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="ordersChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">توزيع المنتجات حسب التصنيف</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="productsChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">الإيرادات الشهرية</h5>
                            </div>
                            <div class="card-body">
                                <div class="chart-container">
                                    <canvas id="revenueChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تحميل بيانات المخططات -->
                <script>
                    setTimeout(() => {
                        initializeCharts(${JSON.stringify(reportsData)});
                    }, 100);
                </script>
            </div>
        `;
    }

    /**
     * تهيئة المخططات
     */
    initializeCharts(reportsData) {
        this.destroyCharts();
        this.createSalesChart(reportsData.salesData);
        this.createOrdersChart(reportsData.ordersData);
        this.createProductsChart(reportsData.productsData);
        this.createRevenueChart(reportsData.revenueData);
    }

    /**
     * تدمير المخططات الحالية
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    /**
     * إنشاء مخطط المبيعات
     */
    createSalesChart(salesData) {
        const ctx = document.getElementById('salesChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'الإيرادات اليومية',
                    data: salesData.data,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' د.أ';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * إنشاء مخطط الطلبات
     */
    createOrdersChart(ordersData) {
        const ctx = document.getElementById('ordersChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.orders = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ordersData.labels,
                datasets: [{
                    data: ordersData.data,
                    backgroundColor: [
                        'rgba(243, 156, 18, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true
                    }
                }
            }
        });
    }

    /**
     * إنشاء مخطط المنتجات
     */
    createProductsChart(productsData) {
        const ctx = document.getElementById('productsChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.products = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productsData.labels,
                datasets: [{
                    label: 'عدد المنتجات',
                    data: productsData.data,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(240, 147, 251, 0.8)',
                        'rgba(79, 172, 254, 0.8)',
                        'rgba(67, 233, 123, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        }
                    }
                }
            }
        });
    }

    /**
     * إنشاء مخطط الإيرادات
     */
    createRevenueChart(revenueData) {
        const ctx = document.getElementById('revenueChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: revenueData.labels,
                datasets: [{
                    label: 'الإيرادات الشهرية',
                    data: revenueData.data,
                    backgroundColor: 'rgba(155, 89, 182, 0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' د.أ';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * إنشاء تقرير PDF
     */
    async generatePDFReport() {
        // في الإصدار الحالي، نعرض رسالة فقط
        alert('توليد تقرير PDF. سيتم تفعيل هذه الميزة قريباً.');
        
        // في المستقبل، يمكن استخدام مكتبة مثل jsPDF
        return null;
    }

    /**
     * إنشاء تقرير Excel
     */
    async generateExcelReport() {
        // في الإصدار الحالي، نعرض رسالة فقط
        alert('توليد تقرير Excel. سيتم تفعيل هذه الميزة قريباً.');
        
        // في المستقبل، يمكن استخدام مكتبة مثل SheetJS
        return null;
    }
}

// إنشاء نسخة من مدير التقارير
const reportsManager = new ReportsManager();

// دالة تهيئة المخططات للاستخدام من HTML
window.initializeCharts = (reportsData) => {
    reportsManager.initializeCharts(reportsData);
};

// دوال عامة للتقارير
async function downloadPDFReport() {
    try {
        await reportsManager.generatePDFReport();
    } catch (error) {
        console.error('❌ خطأ في توليد تقرير PDF:', error);
        alert('فشل توليد تقرير PDF');
    }
}

async function downloadExcelReport() {
    try {
        await reportsManager.generateExcelReport();
    } catch (error) {
        console.error('❌ خطأ في توليد تقرير Excel:', error);
        alert('فشل توليد تقرير Excel');
    }
}

function refreshReports() {
    if (window.appState.currentPage === 'reports') {
        loadPageContent('reports');
    }
}

// تصدير الدوال للاستخدام العام
window.reportsManager = reportsManager;
window.downloadPDFReport = downloadPDFReport;
window.downloadExcelReport = downloadExcelReport;
window.refreshReports = refreshReports;