import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  FileText, 
  ShieldCheck, 
  PhoneCall, 
  Code2, 
  LayoutDashboard, 
  Menu, 
  X,
  Pill,
  Heart,
  ChevronDown
} from 'lucide-react';
import { Product, ProductCategory, UserSession } from '../types/pharmacy';
import { CATEGORIES_CONFIG } from '../data/mockData';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface HeaderProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenPrescription: () => void;
  onOpenBackendDoc: () => void;
  onOpenAuth: () => void;
  user: UserSession | null;
  onLogout: () => void;
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenPrescription,
  onOpenBackendDoc,
  onOpenAuth,
  user,
  onLogout,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  products,
  onSelectProduct,
  isAdminView,
  onToggleAdminView
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search filter
  const searchResults = searchQuery.trim()
    ? products.filter(p => 
        p.name.includes(searchQuery) || 
        p.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.includes(searchQuery) ||
        p.ircCode.includes(searchQuery)
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-emerald-800 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ضمانت اصالت با استعلام کد IRC و برچسب سلامت سازمان غذا و دارو
            </span>
            <span className="hidden md:inline text-emerald-300">·</span>
            <span className="hidden md:inline">ارسال رایگان سفارش‌های بالای ۱ میلیون تومان با کد SALAMAT10</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-100 text-xs mr-auto md:mr-0">
            <a href="tel:02188990022" className="flex items-center gap-1 hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span>مشاوره و پشتیبانی: {toPersianDigits('021-88990022')}</span>
            </a>
            <span className="text-emerald-300">·</span>
            <span className="text-emerald-200">داروخانه شبانه‌روزی دکتر حسینی</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (isAdminView) onToggleAdminView();
                onSelectCategory('all');
              }}
              className="flex items-center gap-2.5 text-right cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  داروخانه سلامت
                </span>
                <span className="block text-[11px] text-slate-500 font-normal">
                  پلتفرم آنلاین فرآورده‌های سلامت و مکمل‌ها
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar with Autocomplete Dropdown */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی نام دارو، مکمل، برند یا کد IRC..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-slate-100/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  نتایج جستجو برای «{searchQuery}»
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onMouseDown={() => {
                      onSelectProduct(product);
                      setIsSearchFocused(false);
                    }}
                    className="w-full text-right px-3 py-2.5 flex items-center justify-between hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-slate-500">{product.brand} · کد IRC: {product.ircCode}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-emerald-700">
                        {formatPrice(product.discountPrice || product.price)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {product.stock > 0 ? 'موجود' : 'ناموجود'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Prescription Upload Button */}
            <button
              onClick={onOpenPrescription}
              className="hidden lg:flex items-center gap-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-700" />
              <span>ارسال نسخه پزشک</span>
            </button>

            {/* FastAPI & Backend Code Helper Button */}
            <button
              onClick={onOpenBackendDoc}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/80 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
              title="مشاهده معماری و کدهای FastAPI + رفع خطای app.routers"
            >
              <Code2 className="w-4 h-4 text-indigo-700" />
              <span className="hidden sm:inline">کدها و رفع خطای FastAPI</span>
            </button>

            {/* Admin Toggle Button */}
            <button
              onClick={onToggleAdminView}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                isAdminView
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isAdminView ? 'مشاهده فروشگاه' : 'پنل مدیریت'}
              </span>
            </button>

            {/* Auth Button */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">{user.phone}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">ورود / ثبت‌نام</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سبد خرید</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-5 text-center">
                  {toPersianDigits(cartCount)}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی دارو، مکمل یا برند..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl py-2 pr-9 pl-3 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (When in Storefront mode) */}
      {!isAdminView && (
        <nav className="border-t border-slate-100 bg-white overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5 whitespace-nowrap">
            {CATEGORIES_CONFIG.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <button
            onClick={() => {
              onOpenPrescription();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl text-xs font-semibold"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            ارسال و بررسی نسخه پزشک
          </button>
          <button
            onClick={() => {
              onOpenBackendDoc();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-900 border border-indigo-200 p-2.5 rounded-xl text-xs font-semibold"
          >
            <Code2 className="w-4 h-4 text-indigo-700" />
            کدها و راهنمای بک‌اند FastAPI
          </button>
        </div>
      )}
    </header>
  );
};
