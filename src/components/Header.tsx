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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice - Hidden on mobile to avoid eating screen space */}
      <div className="hidden md:block bg-emerald-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              ضمانت اصالت با استعلام کد IRC و برچسب سلامت سازمان غذا و دارو
            </span>
            <span className="text-emerald-300">·</span>
            <span>ارسال رایگان سفارش‌های بالای ۱ میلیون تومان با کد SALAMAT10</span>
          </div>

          <div className="flex items-center gap-4 text-emerald-100 text-xs">
            <a href="tel:02188990022" className="flex items-center gap-1 hover:text-white transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span>مشاوره و پشتیبانی: {toPersianDigits('021-88990022')}</span>
            </a>
            <span className="text-emerald-300">·</span>
            <span className="text-emerald-200">داروخانه شبانه‌روزی دکتر خیرخواه</span>
          </div>
        </div>
      </div>

      {/* Main Bar - Compact on Mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (isAdminView) onToggleAdminView();
                onSelectCategory('all');
              }}
              className="flex items-center gap-2 text-right cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="block font-black text-sm sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  داروخانه سلامت
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-normal">
                  دکتر خیرخواه · پروانه ۱۲/۵۰۸
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar with Autocomplete Dropdown (Desktop) */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجوی نام دارو، مکمل، برند یا کد IRC..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full bg-slate-100/80 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm rounded-xl py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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

            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="جستجو"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Admin Toggle Button */}
            <button
              onClick={onToggleAdminView}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors border ${
                isAdminView
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
              }`}
              title={isAdminView ? 'مشاهده فروشگاه' : 'ورود به پنل مدیریت'}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span className="inline">
                {isAdminView ? 'فروشگاه' : 'پنل ادمین'}
              </span>
            </button>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-slate-800 transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">{user.phone}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium text-slate-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">ورود</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-1 sm:gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all hover:shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">سبد</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {toPersianDigits(cartCount)}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="منو"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Collapsible Mobile Search Bar - Only shown if active or toggled */}
        {(mobileSearchOpen || searchQuery) && (
          <div className="mt-2 md:hidden animate-in fade-in duration-150">
            <div className="relative">
              <input
                type="text"
                autoFocus={mobileSearchOpen}
                placeholder="جستجوی دارو، مکمل، برند یا کد IRC..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl py-1.5 pr-8 pl-8 text-slate-800 focus:outline-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery ? (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              ) : (
                <button 
                  onClick={() => setMobileSearchOpen(false)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Navigation Bar (When in Storefront mode) */}
      {!isAdminView && (
        <nav className="border-t border-slate-100 bg-white/95 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center gap-1 py-1 whitespace-nowrap">
            {CATEGORIES_CONFIG.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all flex items-center gap-1 ${
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
        <div className="md:hidden border-t border-slate-200 bg-white p-3 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs text-slate-500">
            <span>داروخانه شبانه‌روزی دکتر خیرخواه</span>
            <span className="font-mono">۰۲۱-۸۸۹۹۰۰۲۲</span>
          </div>

          <button
            onClick={() => {
              onToggleAdminView();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between bg-slate-900 text-white p-2.5 rounded-xl text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>{isAdminView ? 'بازگشت به فروشگاه داروخانه' : 'ورود به پنل مدیریت سایت (ادمین)'}</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-black">
              بدون نیاز به پسورد
            </span>
          </button>

          <button
            onClick={() => {
              onOpenAuth();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between bg-slate-100 text-slate-800 p-2.5 rounded-xl text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <span>{user ? `حساب کاربری (${user.phone})` : 'ورود / ثبت‌نام با پیامک (OTP)'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              onOpenPrescription();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-xl text-xs font-semibold"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            ارسال و بررسی آنلاین نسخه پزشک
          </button>

          <button
            onClick={() => {
              onOpenBackendDoc();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-900 border border-indigo-200 p-2.5 rounded-xl text-xs font-semibold"
          >
            <Code2 className="w-4 h-4 text-indigo-700" />
            سورس‌کدها و راهنمای بک‌اند FastAPI
          </button>
        </div>
      )}
    </header>
  );
};
