import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  Code2,
  Copy,
  Pill,
  Save,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { Product, ProductCategory, Order, Review, PrescriptionRequest } from '../types/pharmacy';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { FASTAPI_CODEBASE } from '../data/fastApiCodeSnippets';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: any, trackingCode?: string) => void;
  reviews: Review[];
  onApproveReview: (reviewId: string) => void;
  onRejectReview: (reviewId: string) => void;
  onReplyReview: (reviewId: string, reply: string) => void;
  prescriptions: PrescriptionRequest[];
  onUpdatePrescriptionStatus: (presId: string, status: any, note?: string) => void;
  onSwitchToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  reviews,
  onApproveReview,
  onRejectReview,
  onReplyReview,
  prescriptions,
  onUpdatePrescriptionStatus,
  onSwitchToStore
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'reviews' | 'prescriptions' | 'backend'>('dashboard');

  // Search & Filter in Products table
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    englishName: '',
    category: 'supplements',
    subcategory: 'مکمل عمومی',
    brand: '',
    price: 350000,
    discountPrice: undefined,
    stock: 20,
    ircCode: '',
    sku: '',
    dosageForm: 'قرص',
    countryOfOrigin: 'ایران',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    description: '',
    shortDescription: '',
    usageInstructions: 'روزی یک عدد بعد از غذا با یک لیوان آب میل شود.',
    ingredients: ['ویتامین‌ها و املاح معدنی'],
    rating: 5.0,
    reviewCount: 0
  });

  // Reply Review State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [pharmacistReplyText, setPharmacistReplyText] = useState('');

  // Selected order tracking code edit
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newTrackingCode, setNewTrackingCode] = useState('');

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.includes(productSearch) || p.englishName.toLowerCase().includes(productSearch.toLowerCase()) || p.ircCode.includes(productSearch);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Dashboard Stats
  const totalSales = orders.filter(o => o.status !== 'canceled').reduce((sum, o) => sum + o.finalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'preparing' || o.status === 'paid').length;
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const pendingReviewsCount = reviews.filter(r => !r.isApproved).length;

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.brand || !newProduct.price) {
      alert('لطفاً فیلدهای الزامی نام، برند و قیمت را تکمیل کنید.');
      return;
    }

    const created: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name!,
      englishName: newProduct.englishName || newProduct.name!,
      slug: (newProduct.englishName || newProduct.name!).toLowerCase().replace(/\s+/g, '-'),
      category: newProduct.category as ProductCategory || 'supplements',
      subcategory: newProduct.subcategory || 'سایر اقلام',
      brand: newProduct.brand!,
      price: Number(newProduct.price),
      discountPrice: newProduct.discountPrice ? Number(newProduct.discountPrice) : undefined,
      stock: Number(newProduct.stock || 10),
      ircCode: newProduct.ircCode || String(Math.floor(10000000000000 + Math.random() * 90000000000000)),
      sku: newProduct.sku || `DKH-${Math.floor(1000 + Math.random() * 9000)}`,
      description: newProduct.description || 'توضیحات فرآورده دارویی / مکمل سلامت‌محور',
      shortDescription: newProduct.shortDescription || 'محصول استاندارد دارای پروانه ساخت سازمان غذا و دارو',
      usageInstructions: newProduct.usageInstructions || 'طبق دستور پزشک یا داروساز مصرف شود.',
      ingredients: typeof newProduct.ingredients === 'string' 
        ? (newProduct.ingredients as string).split(',').map(s => s.trim()) 
        : newProduct.ingredients || ['مواد موثره استاندارد'],
      dosageForm: newProduct.dosageForm || 'قرص',
      countryOfOrigin: newProduct.countryOfOrigin || 'ایران',
      image: newProduct.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      rating: 5,
      reviewCount: 1,
      isPopular: true
    };

    onAddProduct(created);
    setIsAddModalOpen(false);
    // Reset
    setNewProduct({
      name: '',
      englishName: '',
      category: 'supplements',
      subcategory: 'مکمل عمومی',
      brand: '',
      price: 350000,
      stock: 20,
      dosageForm: 'قرص',
      countryOfOrigin: 'ایران',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      description: '',
      usageInstructions: 'روزی یک عدد بعد از غذا با یک لیوان آب میل شود.',
      ingredients: ['ویتامین‌ها و املاح معدنی']
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Admin Header */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Pill className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black">پنل جامع مدیریت داروخانه آنلاین سلامت</h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md font-bold">
                  نسخه ۲.۰ فعال
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مسئول فنی: دکتر م. خیرخواه (پروانه اشتغال داروسازی سازمان نظام پزشکی: د-۲۴۹۰)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن داروی جدید / مکمل</span>
            </button>

            <button
              onClick={onSwitchToStore}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              مشاهده نمای مشتری فروشگاه
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>داشبورد و آمار فروش</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>مدیریت داروها و انبار ({toPersianDigits(products.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>سفارش‌ها و صدور بارکد پستی ({toPersianDigits(orders.length)})</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {toPersianDigits(pendingOrdersCount)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>بررسی نظرات کاربران ({toPersianDigits(reviews.length)})</span>
            {pendingReviewsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {toPersianDigits(pendingReviewsCount)} جدید
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>نسخه‌های ارسالی بیماران ({toPersianDigits(prescriptions.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backend'
                ? 'bg-white text-indigo-900 shadow-sm border border-indigo-200'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>کدهای بک‌اند و معماری FastAPI</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span>فروش کل داروخانه</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{formatPrice(totalSales)}</div>
                <div className="text-[11px] text-emerald-600 mt-1">تراکنش‌های موفق شاپرک</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span>سفارشات در انتظار آماده‌سازی</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{toPersianDigits(pendingOrdersCount)} فاکتور</div>
                <div className="text-[11px] text-amber-600 mt-1">نیاز به بسته‌بندی و تحویل به پیک</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span>هشدار کسری موجودی انبار</span>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-lg font-black text-rose-600">{toPersianDigits(lowStockCount)} قلم دارو</div>
                <div className="text-[11px] text-rose-500 mt-1">موجودی زیر ۱۰ عدد</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                  <span>دیدگاه‌های منتظر تایید داروساز</span>
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-lg font-black text-slate-900">{toPersianDigits(pendingReviewsCount)} دیدگاه</div>
                <div className="text-[11px] text-indigo-600 mt-1">جهت تایید پزشکی و انتشار</div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm text-slate-900">آخرین فاکتورها و تراکنش‌های دریافتی</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  مشاهده همه سفارش‌ها
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">شماره سفارش</th>
                      <th className="py-3 px-4">گیرنده</th>
                      <th className="py-3 px-4">روش ارسال</th>
                      <th className="py-3 px-4">مبلغ فاکتور</th>
                      <th className="py-3 px-4">وضعیت</th>
                      <th className="py-3 px-4">کد رهگیری مرسوله</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{ord.orderNumber}</td>
                        <td className="py-3 px-4 text-slate-700">{ord.address.recipientName} ({ord.address.city})</td>
                        <td className="py-3 px-4 text-slate-600">{ord.shippingMethod}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{formatPrice(ord.finalAmount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            ord.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                            ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {ord.status === 'paid' ? 'پرداخت شده' :
                             ord.status === 'preparing' ? 'در حال آماده‌سازی' :
                             ord.status === 'shipped' ? 'تحویل به پیک/پست' : ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {ord.shippingTrackingCode || 'ثبت نشده'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            
            {/* Table Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="جستجوی نام کالا، برند یا کد IRC..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-emerald-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-emerald-600 whitespace-nowrap"
                >
                  <option value="all">همه دسته‌ها</option>
                  <option value="supplements">مکمل غذایی</option>
                  <option value="sports">مکمل ورزشی</option>
                  <option value="skin-hair">پوست و مو</option>
                  <option value="baby-mom">مادر و کودک</option>
                  <option value="medical-devices">تجهیزات پزشکی</option>
                  <option value="hygiene-intimate">بهداشت</option>
                  <option value="otc-medicines">داروهای تسکین‌دهنده</option>
                </select>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن داروی جدید / مکمل</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">تصویر</th>
                    <th className="py-3 px-3">نام فارسی و انگلیسی</th>
                    <th className="py-3 px-3">کد IRC غذا و دارو</th>
                    <th className="py-3 px-3">برند / فرم</th>
                    <th className="py-3 px-3">قیمت (تومان)</th>
                    <th className="py-3 px-3">موجودی انبار</th>
                    <th className="py-3 px-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{prod.name}</div>
                        <div className="text-[10px] text-slate-400 font-sans" dir="ltr">{prod.englishName}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {prod.ircCode}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{prod.brand}</span>
                        <span className="text-[10px] text-slate-400 block">{prod.dosageForm}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-700">
                        {formatPrice(prod.discountPrice || prod.price)}
                        {prod.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatPrice(prod.price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={prod.stock}
                            onChange={(e) => onUpdateProduct({ ...prod, stock: Number(e.target.value) })}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-xs"
                          />
                          <span className="text-[10px] text-slate-400">عدد</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`آیا از حذف داروی «${prod.name}» مطمئن هستید؟`)) {
                              onDeleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف کالا"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: ORDERS & SHIPPING BARCODE */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              مدیریت سفارش‌ها و ثبت کدهای رهگیری ارسال (پست / الوپیک / اسنپ‌باکس)
            </h3>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{ord.date}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-emerald-700">{formatPrice(ord.finalAmount)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">تغییر وضعیت سفارش:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-emerald-600"
                      >
                        <option value="pending_payment">در انتظار پرداخت</option>
                        <option value="paid">پرداخت موفق</option>
                        <option value="preparing">در حال آماده‌سازی در داروخانه</option>
                        <option value="shipped">تحویل به پیک/پست</option>
                        <option value="delivered">تحویل داده شده به بیمار</option>
                        <option value="canceled">لغو سفارش</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Info & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-bold text-slate-800 mb-1">مشخصات تحویل‌گیرنده:</div>
                      <div className="text-slate-600 leading-relaxed">
                        {ord.address.recipientName} ({ord.address.phone})
                        <br />
                        {ord.address.province} - {ord.address.city} - {ord.address.postalAddress}
                        <br />
                        <span className="font-mono text-slate-500">کد پستی: {ord.address.postalCode}</span>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-800 mb-1">اقلام خریداری شده:</div>
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700 bg-white p-1.5 rounded-lg border border-slate-200/60">
                            <span>{it.productName}</span>
                            <span className="font-mono">{toPersianDigits(it.quantity)} × {formatPrice(it.priceAtPurchase)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Code Updater */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600">روش ارسال: <strong>{ord.shippingMethod}</strong></span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-600">کد رهگیری: <strong className="font-mono text-slate-900">{ord.shippingTrackingCode || 'ثبت نشده'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="درج کد بارکد پستی یا سفر پیک..."
                        value={editingOrderId === ord.id ? newTrackingCode : ''}
                        onFocus={() => {
                          setEditingOrderId(ord.id);
                          setNewTrackingCode(ord.shippingTrackingCode || '');
                        }}
                        onChange={(e) => setNewTrackingCode(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono"
                      />
                      {editingOrderId === ord.id && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(ord.id, ord.status, newTrackingCode);
                            setEditingOrderId(null);
                          }}
                          className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold"
                        >
                          ثبت کد
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              مدیریت و نظارت بر دیدگاه‌ها و پاسخ‌های داروساز داروخانه
            </h3>

            <div className="space-y-4">
              {reviews.map((rev) => {
                const prod = products.find(p => p.id === rev.productId);
                return (
                  <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rev.userName}</span>
                        <span className="text-slate-400">برای کالای:</span>
                        <span className="font-semibold text-emerald-700">{prod ? prod.name : rev.productId}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rev.isApproved ? 'تایید و منتشر شده' : 'در انتظار بررسی'}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      «{rev.comment}»
                    </p>

                    {rev.adminReply && (
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                        <strong>پاسخ ثبت شده دکتر داروساز:</strong> {rev.adminReply}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        {!rev.isApproved ? (
                          <button
                            onClick={() => onApproveReview(rev.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تایید و انتشار عمومی در سایت</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onRejectReview(rev.id)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                          >
                            عدم نمایش در سایت
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setPharmacistReplyText(rev.adminReply || '');
                          }}
                          className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          ثبت / ویرایش پاسخ داروساز
                        </button>
                      </div>

                      <button
                        onClick={() => onRejectReview(rev.id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5"
                        title="حذف کامل کامنت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {replyingReviewId === rev.id && (
                      <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 mt-2">
                        <label className="block text-[11px] font-bold text-indigo-900">پاسخ تخصصی مسئول فنی داروخانه:</label>
                        <textarea
                          rows={2}
                          value={pharmacistReplyText}
                          onChange={(e) => setPharmacistReplyText(e.target.value)}
                          placeholder="مثلاً: سلام و احترام. این فرآورده به دلیل خلوص بالا برای بهبود سریع‌تر عضلات توصیه می‌شود..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-indigo-600"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onReplyReview(rev.id, pharmacistReplyText);
                              setReplyingReviewId(null);
                            }}
                            className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            ثبت پاسخ
                          </button>
                          <button
                            onClick={() => setReplyingReviewId(null)}
                            className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs"
                          >
                            انصراف
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              نسخه‌های آپلود شده و درخواست‌های مشاوره دارویی بیماران
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((pres) => (
                <div key={pres.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{pres.patientName}</span>
                    <span className="font-mono text-slate-500">{pres.patientPhone}</span>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                    <img src={pres.prescriptionImage} alt="نسخه پزشک" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div>پوشش بیمه: <strong>{pres.insuranceType}</strong></div>
                    {pres.notes && <div>توضیحات بیمار: {pres.notes}</div>}
                    {pres.pharmacistNotes && (
                      <div className="text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                        یادداشت داروساز: {pres.pharmacistNotes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => onUpdatePrescriptionStatus(pres.id, 'approved', 'اقلام موجود است')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-center"
                    >
                      تایید اقلام نسخه
                    </button>
                    <button
                      onClick={() => onUpdatePrescriptionStatus(pres.id, 'rejected', 'نسخه ناخواناست')}
                      className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold"
                    >
                      رد
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BACKEND CODE & FASTAPI ARCHITECTURE */}
        {activeTab === 'backend' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  سورس‌کدهای کامل و بدون نقص FastAPI + PostgreSQL برای آرچ لینوکس
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تمام فایل‌ها جهت رفع خطای <code className="bg-slate-100 px-1 rounded font-mono">ModuleNotFoundError: No module named 'app.routers'</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FASTAPI_CODEBASE.map((f, i) => (
                <div key={i} className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="font-bold">{f.filename}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(f.code);
                        alert(`کد فایل ${f.filename} در کلیپ‌بورد کپی شد.`);
                      }}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">{f.path}</div>
                  <pre className="max-h-48 overflow-y-auto text-[11px] bg-black/40 p-2 rounded-lg text-slate-200" dir="ltr">
                    {f.code}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                  تعریف داروی جدید، مکمل یا محصول بهداشتی
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="overflow-y-auto p-6 space-y-4 flex-1 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نام فارسی کالا *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="مثلاً: کپسول مولتی ویتامین فارماتون"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">نام انگلیسی کالا</label>
                  <input
                    type="text"
                    value={newProduct.englishName}
                    onChange={(e) => setNewProduct({ ...newProduct, englishName: e.target.value })}
                    placeholder="Pharmaton Vitality Capsules"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600 font-sans"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">دسته‌بندی کالا *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  >
                    <option value="supplements">مکمل غذایی و رژیمی</option>
                    <option value="sports">مکمل ورزشی و بدنسازی</option>
                    <option value="skin-hair">مراقبت پوست و مو</option>
                    <option value="baby-mom">مادر و کودک</option>
                    <option value="medical-devices">تجهیزات پزشکی خانگی</option>
                    <option value="hygiene-intimate">بهداشت شخصی و زناشویی</option>
                    <option value="otc-medicines">داروهای بدون نسخه (OTC)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">برند سازنده *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="مثلاً: کاله پرو، لافارر"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">فرم دارویی</label>
                  <input
                    type="text"
                    value={newProduct.dosageForm}
                    onChange={(e) => setNewProduct({ ...newProduct, dosageForm: e.target.value })}
                    placeholder="قرص، کپسول، شربت، پودر..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">قیمت فروش (تومان) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">قیمت با تخفیف (اختیاری)</label>
                  <input
                    type="number"
                    value={newProduct.discountPrice || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="در صورت وجود تخفیف"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">موجودی انبار (تعداد) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">کد IRC سازمان غذا و دارو (الزامی در ایران)</label>
                  <input
                    type="text"
                    value={newProduct.ircCode}
                    onChange={(e) => setNewProduct({ ...newProduct, ircCode: e.target.value })}
                    placeholder="مثلاً: 12280974510098"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">کشور سازنده</label>
                  <input
                    type="text"
                    value={newProduct.countryOfOrigin}
                    onChange={(e) => setNewProduct({ ...newProduct, countryOfOrigin: e.target.value })}
                    placeholder="ایران، آلمان، سوئیس..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">آدرس تصویر کالا (URL)</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">توضیحات و مزایای محصول</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">دستور مصرف</label>
                <input
                  type="text"
                  value={newProduct.usageInstructions}
                  onChange={(e) => setNewProduct({ ...newProduct, usageInstructions: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>ثبت و ذخیره دارو در سامانه</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
