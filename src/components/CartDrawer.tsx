import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { CartItem } from '../types/pharmacy';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 
    0
  );

  const freeShippingThreshold = 1000000; // 1,000,000 Tomans
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalAmount);
  const freeShippingPercent = Math.min(100, Math.round((totalAmount / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-r border-slate-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-sm sm:text-base text-slate-800">
              سبد خرید داروخانه ({toPersianDigits(cart.length)} قلم)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100">
          <div className="flex items-center justify-between text-xs text-emerald-900 mb-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              {remainingForFreeShipping === 0 ? (
                <span className="font-bold text-emerald-700">ارسال رایگان شامل سفارش شما شد! 🎉</span>
              ) : (
                <span>
                  فقط <strong className="font-bold">{formatPrice(remainingForFreeShipping)}</strong> تا ارسال رایگان
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-emerald-700">{toPersianDigits(freeShippingPercent)}٪</span>
          </div>
          <div className="w-full h-1.5 bg-emerald-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
              style={{ width: `${freeShippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-600 text-sm font-medium">سبد خرید شما در حال حاضر خالی است.</p>
              <p className="text-slate-400 text-xs">می‌توانید انواع مکمل‌ها، ویتامین‌ها و محصولات بهداشتی را به سبد خود اضافه کنید.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                مشاهده محصولات فروشگاه
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const currentPrice = item.product.discountPrice || item.product.price;
              return (
                <div 
                  key={item.product.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200 flex gap-3 items-center hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 mb-2">
                      {item.product.brand} · IRC: {item.product.ircCode}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700">
                        {formatPrice(currentPrice * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                          title="کاهش تعداد"
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {toPersianDigits(item.quantity)}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 hover:bg-white rounded text-slate-600 transition-colors disabled:opacity-30"
                          title="افزایش تعداد"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>مجموع اقلام ({toPersianDigits(cart.length)} نوع کالا):</span>
              <span className="font-bold text-slate-800">{formatPrice(totalAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200/60">
              <span>مبلغ نهایی فاکتور:</span>
              <span className="text-base text-emerald-700">{formatPrice(totalAmount)}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>تکمیل اطلاعات و ثبت سفارش</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>پرداخت امن از طریق درگاه شاپرک با ضمانت بازگشت وجه</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
