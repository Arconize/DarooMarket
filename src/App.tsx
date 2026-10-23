import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  PhoneCall, 
  FileText, 
  Filter, 
  ArrowUpDown, 
  Pill, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Flame,
  Award,
  Search,
  MessageSquare
} from 'lucide-react';
import { Product, CartItem, Order, Review, PrescriptionRequest, UserSession } from './types/pharmacy';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_PRESCRIPTIONS, CATEGORIES_CONFIG } from './data/mockData';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { OtpAuthModal } from './components/OtpAuthModal';
import { FastApiHelperModal } from './components/FastApiHelperModal';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { formatPrice, toPersianDigits } from './utils/formatters';

export default function App() {
  // Persistent Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pharmacy_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Persistent Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pharmacy_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Persistent Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('pharmacy_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Persistent Prescriptions
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>(() => {
    const saved = localStorage.getItem('pharmacy_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  // Persistent User
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('pharmacy_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Store View / Admin View
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBackendDocOpen, setIsBackendDocOpen] = useState(false);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySpecialOffers, setOnlySpecialOffers] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'cheap' | 'expensive' | 'rating'>('popular');

  // Recently added animation indicator
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('pharmacy_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pharmacy_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pharmacy_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pharmacy_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('pharmacy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('pharmacy_user');
    }
  }, [user]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } 
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1200);
    showToast(`«${product.name}» به سبد خرید اضافه شد.`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(item.product.stock, newQty) } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Review submission
  const handleReviewSubmit = (productId: string, rating: number, comment: string, name: string) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: name,
      userPhoneMasked: '۰۹۱۲***۷۷۶۶',
      rating,
      comment,
      date: 'لحظاتی پیش',
      isApproved: false, // Moderated by pharmacist
      purchaseVerified: true
    };
    setReviews(prev => [newRev, ...prev]);
    showToast('دیدگاه شما ارسال شد و پس از تایید مسئول فنی منتشر خواهد شد.');
  };

  // Prescription Submission
  const handlePrescriptionSubmit = (pres: PrescriptionRequest) => {
    setPrescriptions(prev => [pres, ...prev]);
  };

  // Admin CRUD for products
  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => [newProd, ...prev]);
    showToast(`داروی جدید «${newProd.name}» با موفقیت به انبار داروخانه اضافه شد.`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('کالای مورد نظر از انبار حذف گردید.');
  };

  // Admin Order update
  const handleUpdateOrderStatus = (orderId: string, status: any, trackingCode?: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status,
          ...(trackingCode !== undefined ? { shippingTrackingCode: trackingCode } : {})
        };
      }
      return ord;
    }));
    showToast('وضعیت سفارش بروزرسانی شد.');
  };

  // Admin Review actions
  const handleApproveReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: true } : r));
    showToast('دیدگاه با موفقیت تایید و در سایت منتشر شد.');
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('دیدگاه حذف شد.');
  };

  const handleReplyReview = (reviewId: string, reply: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, adminReply: reply } : r));
    showToast('پاسخ داروساز ثبت گردید.');
  };

  const handleUpdatePrescription = (presId: string, status: any, note?: string) => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === presId) {
        return { ...p, status, ...(note ? { pharmacistNotes: note } : {}) };
      }
      return p;
    }));
    showToast('وضعیت نسخه بیمار به روزرسانی شد.');
  };

  // Filtered & Sorted products for storefront
  const displayProducts = products
    .filter(p => {
      const matchCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = searchQuery.trim() === '' || 
        p.name.includes(searchQuery) || 
        p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.includes(searchQuery) ||
        p.ircCode.includes(searchQuery);
      const matchStock = !onlyInStock || p.stock > 0;
      const matchSpecial = !onlySpecialOffers || !!p.discountPrice;
      return matchCategory && matchSearch && matchStock && matchSpecial;
    })
    .sort((a, b) => {
      if (sortBy === 'cheap') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      }
      if (sortBy === 'expensive') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // default: popular
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

  const specialOffers = products.filter(p => p.discountPrice && p.stock > 0);
  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Vazirmatn'] text-slate-800" dir="rtl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom duration-300 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        cartTotal={cartTotalAmount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenBackendDoc={() => setIsBackendDocOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={() => setUser(null)}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setActiveCategory(catId);
          if (isAdminView) setIsAdminView(false);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
      />

      {/* VIEW 1: ADMIN PANEL */}
      {isAdminView ? (
        <main className="flex-1">
          <AdminPanel
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            reviews={reviews}
            onApproveReview={handleApproveReview}
            onRejectReview={handleRejectReview}
            onReplyReview={handleReplyReview}
            prescriptions={prescriptions}
            onUpdatePrescriptionStatus={handleUpdatePrescription}
            onSwitchToStore={() => setIsAdminView(false)}
          />
        </main>
      ) : (
        /* VIEW 2: CUSTOMER STOREFRONT */
        <main className="flex-1 pb-16">
          
          {/* Hero Section */}
          <section className="bg-gradient-to-b from-emerald-800 via-teal-900 to-slate-900 text-white py-12 px-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Hero text */}
                <div className="lg:col-span-7 space-y-4 text-right">
                  <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>داروخانه آنلاین سلامت با نظارت رسمی سازمان غذا و دارو (IRC)</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                    خرید آسان مکمل‌های غذایی، ورزشی و فرآورده‌های سلامت‌محور
                  </h1>

                  <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
                    تضمین ۱۰۰٪ اصالت دارو و مکمل با قابلیت استعلام کد IRC، مشاوره تخصصی رایگان با دکتر داروساز، تحویل فوری ۲ ساعته در تهران با الوپیک و ارسال پستی سراسری به تمام نقاط ایران.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                    >
                      مشاهده کاتالوگ و خرید مکمل‌ها
                    </button>

                    <button
                      onClick={() => setIsPrescriptionOpen(true)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
                    >
                      <FileText className="w-4 h-4 text-amber-300" />
                      <span>ارسال نسخه پزشک</span>
                    </button>

                    <button
                      onClick={() => setIsBackendDocOpen(true)}
                      className="bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 border border-indigo-400/30 font-medium px-4 py-3 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      مشاهده راهنمای رفع باگ بک‌اند FastAPI
                    </button>
                  </div>
                </div>

                {/* Hero Featured Card */}
                <div className="lg:col-span-5">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-white shadow-2xl relative">
                    <div className="flex items-center justify-between text-xs mb-3 text-emerald-200">
                      <span className="flex items-center gap-1 font-bold">
                        <Flame className="w-4 h-4 text-amber-400" />
                        پیشنهاد ویژه روز داروخانه
                      </span>
                      <span className="bg-rose-500 text-white font-black px-2 py-0.5 rounded-lg text-[11px]">
                        ۱۵٪ تخفیف
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <img
                        src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
                        alt="فارماتون اورجینال"
                        className="w-24 h-24 rounded-2xl object-cover border border-white/20 shrink-0"
                      />
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-white">کپسول مولتی ویتامین فارماتون اورجینال</h3>
                        <p className="text-[11px] text-emerald-100 line-clamp-2">
                          حاوی جینسنگ G115 جهت رفع خستگی مفرط و افزایش تمرکز
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs text-slate-300 line-through">۱,۸۵۰,۰۰۰</span>
                          <span className="text-sm font-black text-amber-300">۱,۶۹۰,۰۰۰ تومان</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const pharmaton = products.find(p => p.id === 'prod-1');
                        if (pharmaton) setSelectedProduct(pharmaton);
                      }}
                      className="w-full mt-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      بررسی تخصصی و استعلام کد IRC
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 4 Trust Pillars */}
          <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-3xl shadow-xl border border-slate-200/80">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-xs text-slate-900">ضمانت اصالت با IRC</h4>
                  <p className="text-[11px] text-slate-500">پروانه رسمی غذا و دارو</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-xs text-slate-900">ارسال با الوپیک و پست</h4>
                  <p className="text-[11px] text-slate-500">تحویل ۲ ساعته در تهران</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-xs text-slate-900">مشاوره با داروساز</h4>
                  <p className="text-[11px] text-slate-500">پاسخگویی رایگان شبانه‌روزی</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-xs text-slate-900">درگاه امن شاپرک</h4>
                  <p className="text-[11px] text-slate-500">زرین‌پال و بانک‌های عضو شتاب</p>
                </div>
              </div>
            </div>
          </section>

          {/* Special Offers Section */}
          {specialOffers.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 mt-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">پیشنهادات شگفت‌انگیز داروخانه</h2>
                    <p className="text-xs text-slate-500">تخفیف‌های ویژه بر روی مکمل‌های منتخب با موجودی محدود</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {specialOffers.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
                    isAdded={justAddedId === product.id}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Main Catalog Section */}
          <section id="catalog" className="max-w-7xl mx-auto px-4 mt-12 space-y-6">
            
            {/* Catalog Header & Filters Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    کاتالوگ داروها، مکمل‌ها و اقلام بهداشتی
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    نمایش {toPersianDigits(displayProducts.length)} محصول استاندارد با کد ثبت رسمی
                  </p>
                </div>

                {/* Sorters & Toggles */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  
                  {/* In-stock toggle */}
                  <label className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700">فقط کالاهای موجود</span>
                  </label>

                  {/* Special offer toggle */}
                  <label className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlySpecialOffers}
                      onChange={(e) => setOnlySpecialOffers(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700">تخفیف‌دارها</span>
                  </label>

                  {/* Sort selector */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="popular">محبوب‌ترین‌ها</option>
                      <option value="cheap">ارزان‌ترین</option>
                      <option value="expensive">گران‌ترین</option>
                      <option value="rating">بالاترین امتیاز</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-slate-100">
                {CATEGORIES_CONFIG.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Grid */}
            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">هیچ دارویی با این مشخصات یافت نشد!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  فیلترها را تغییر دهید یا نام داروی دیگری را جستجو کنید. همچنین می‌توانید با دکتر داروساز تماس بگیرید.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setOnlySpecialOffers(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  حذف تمام فیلترها
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p, e) => handleAddToCart(p, 1, e)}
                    isAdded={justAddedId === product.id}
                  />
                ))}
              </div>
            )}

          </section>

          {/* Prescription Consultation Banner */}
          <section className="max-w-7xl mx-auto px-4 mt-14">
            <div className="bg-gradient-to-r from-amber-700 via-yellow-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg text-xs font-semibold text-amber-200">
                  <FileText className="w-4 h-4" />
                  <span>پذیرش نسخه الکترونیک تامین اجتماعی و سلامت</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black">
                  نسخه کاغذی یا الکترونیک پزشک دارید؟
                </h3>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                  تصویر نسخه یا کد پیگیری خود را ارسال کنید تا داروساز داروخانه پس از استعلام موجودی و محاسبات بیمه، داروها را با پیک فوری برای شما ارسال نماید.
                </p>
              </div>

              <button
                onClick={() => setIsPrescriptionOpen(true)}
                className="bg-white hover:bg-amber-50 text-slate-900 font-extrabold px-6 py-3.5 rounded-2xl text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                ثبت آنلاین نسخه پزشک
              </button>
            </div>
          </section>

        </main>
      )}

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        reviews={reviews}
        onSubmitReview={handleReviewSubmit}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderCreated={(newOrd) => setOrders(prev => [newOrd, ...prev])}
        onClearCart={handleClearCart}
      />

      <PrescriptionUploadModal
        isOpen={isPrescriptionOpen}
        onClose={() => setIsPrescriptionOpen(false)}
        onSubmitPrescription={handlePrescriptionSubmit}
      />

      <OtpAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={(loggedUser) => {
          setUser(loggedUser);
          showToast(`خوش‌آمدید ${loggedUser.name}!`);
        }}
        onLogout={() => {
          setUser(null);
          showToast('از حساب کاربری خارج شدید.');
        }}
      />

      <FastApiHelperModal
        isOpen={isBackendDocOpen}
        onClose={() => setIsBackendDocOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenPrescription={() => setIsPrescriptionOpen(true)}
        onOpenBackendDoc={() => setIsBackendDocOpen(true)}
      />

    </div>
  );
}
