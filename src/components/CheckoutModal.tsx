import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronLeft, 
  AlertCircle,
  Building,
  Printer,
  Copy,
  Clock,
  ExternalLink
} from 'lucide-react';
import { CartItem, ShippingMethod, ShippingMethodId, Address, Order } from '../types/pharmacy';
import { SHIPPING_METHODS } from '../data/mockData';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderCreated: (order: Order) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onOrderCreated,
  onClearCart
}) => {
  const [step, setStep] = useState<'details' | 'payment_gateway' | 'receipt'>('details');

  // Address & Customer Info
  const [address, setAddress] = useState<Address>({
    recipientName: 'مهدی غفوری',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    province: 'تهران',
    city: 'تهران',
    postalAddress: 'خیابان مطهری، خیابان میرعماد، کوچه دوم، پلاک ۱۵، واحد ۳',
    postalCode: '۱۵۸۷۶۴۵۳۲۱'
  });

  // Shipping
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethodId>('alopeyk');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Gateway
  const [gateway, setGateway] = useState<'zarinpal' | 'saman' | 'mellat'>('zarinpal');

  // Completed Order
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Simulated gateway card fields
  const [cardNumber, setCardNumber] = useState('6037 9975 1234 5678');
  const [cvv2, setCvv2] = useState('456');
  const [otpCode, setOtpCode] = useState('849201');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!isOpen) return null;

  const totalProductsPrice = cart.reduce(
    (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 
    0
  );

  const currentShippingMethod = SHIPPING_METHODS.find(s => s.id === selectedShipping) || SHIPPING_METHODS[0];
  const shippingCost = totalProductsPrice >= 1000000 ? 0 : currentShippingMethod.baseCost;
  const finalAmount = Math.max(0, totalProductsPrice + shippingCost - appliedDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'SALAMAT10') {
      const discount = Math.round(totalProductsPrice * 0.1);
      setAppliedDiscount(discount);
      setCouponMessage({ text: `کد تخفیف ۱۰٪ سلامت با موفقیت اعمال شد (${formatPrice(discount)})`, isError: false });
    } else if (code === 'NOROOZ') {
      setAppliedDiscount(150000);
      setCouponMessage({ text: 'کد تخفیف ۱۵۰ هزار تومانی اعمال شد', isError: false });
    } else {
      setCouponMessage({ text: 'کد تخفیف وارد شده معتبر نمی‌باشد.', isError: true });
    }
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.recipientName || !address.phone || !address.postalAddress) {
      alert('لطفاً مشخصات گیرنده و آدرس را کامل وارد کنید.');
      return;
    }
    setStep('payment_gateway');
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const generatedOrderNumber = `DKH-${Math.floor(10000 + Math.random() * 90000)}`;
      const trackingCode = selectedShipping === 'alopeyk' 
        ? `ALO-TEH-${Math.floor(10000 + Math.random() * 90000)}`
        : selectedShipping === 'snappbox'
        ? `SNAP-${Math.floor(100000 + Math.random() * 900000)}`
        : `POST-IR-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: generatedOrderNumber,
        date: new Date().toLocaleDateString('fa-IR'),
        status: 'paid',
        items: cart.map(i => ({
          productId: i.product.id,
          productName: i.product.name,
          priceAtPurchase: i.product.discountPrice || i.product.price,
          quantity: i.quantity,
          image: i.product.image
        })),
        totalProductsPrice,
        shippingCost,
        discountAmount: appliedDiscount,
        finalAmount,
        shippingMethod: selectedShipping,
        shippingTrackingCode: trackingCode,
        paymentGateway: gateway,
        bankRefId: `ZP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        address
      };

      setCompletedOrder(newOrder);
      onOrderCreated(newOrder);
      onClearCart();
      setStep('receipt');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-sm sm:text-base text-slate-800">
              {step === 'details' && 'تکمیل آدرس و انتخاب شیوه ارسال داروخانه'}
              {step === 'payment_gateway' && 'درگاه امن پرداخت اینترنتی شاپرک (زرین‌پال)'}
              {step === 'receipt' && 'رسید نهایی و ثبت سفارش داروخانه'}
            </h2>
          </div>

          {step !== 'payment_gateway' && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* STEP 1: Address & Shipping & Coupon */}
          {step === 'details' && (
            <form onSubmit={handleStartPayment} className="space-y-6">
              
              {/* Recipient Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  اطلاعات تحویل‌گیرنده و آدرس ارسال
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">نام و نام خانوادگی گیرنده</label>
                    <input
                      type="text"
                      required
                      value={address.recipientName}
                      onChange={(e) => setAddress({ ...address, recipientName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">شماره همراه (جهت هماهنگی پیک و دریافت کد رهگیری)</label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">استان</label>
                    <input
                      type="text"
                      required
                      value={address.province}
                      onChange={(e) => setAddress({ ...address, province: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">شهر</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">نشانی دقیق پستی</label>
                  <textarea
                    rows={2}
                    required
                    value={address.postalAddress}
                    onChange={(e) => setAddress({ ...address, postalAddress: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">کد پستی ۱۰ رقمی</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              {/* Shipping Carrier API Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    انتخاب روش و حامل حمل و نقل (Shipping API)
                  </span>
                  {shippingCost === 0 && (
                    <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                      ارسال رایگان فعال است
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SHIPPING_METHODS.map((method) => {
                    const isSelected = selectedShipping === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedShipping(method.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-slate-900">{method.name}</span>
                            <span className="text-[11px] font-mono text-emerald-800 font-bold">
                              {shippingCost === 0 ? 'رایگان' : formatPrice(method.baseCost)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                            {method.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                          <span>زمان تحویل: {method.estimatedTime}</span>
                          <span className="font-semibold text-slate-600">{method.provider}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Coupon Code section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">کد تخفیف داروخانه</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="کد تخفیف (مثلاً SALAMAT10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    اعمال کد
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Payment Gateway Picker */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  انتخاب درگاه پرداخت آنلاین شاپرک
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setGateway('zarinpal')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      gateway === 'zarinpal'
                        ? 'border-amber-500 bg-amber-50/50 font-bold text-amber-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">زرین‌پال (ZarinPal)</div>
                    <div className="text-[10px] text-slate-400">درگاه واسط رسمی شاپرک</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGateway('mellat')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      gateway === 'mellat'
                        ? 'border-emerald-600 bg-emerald-50/50 font-bold text-emerald-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">به‌پرداخت ملت</div>
                    <div className="text-[10px] text-slate-400">درگاه مستقیم بانکی</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGateway('saman')}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${
                      gateway === 'saman'
                        ? 'border-blue-600 bg-blue-50/50 font-bold text-blue-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">پرداخت الکترونیک سامان</div>
                    <div className="text-[10px] text-slate-400">درگاه شاپرک سپ</div>
                  </button>
                </div>
              </div>

              {/* Summary & Submit */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>مبلغ کل محصولات:</span>
                  <span>{formatPrice(totalProductsPrice)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>هزینه حمل و نقل ({currentShippingMethod.name}):</span>
                  <span>{shippingCost === 0 ? 'رایگان' : formatPrice(shippingCost)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>تخفیف اعمال شده:</span>
                    <span>- {formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-emerald-200">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-base text-emerald-800">{formatPrice(finalAmount)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>اتصال به درگاه پرداخت شاپرک و نهایی کردن خرید</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Simulated Shaparak Payment Portal */}
          {step === 'payment_gateway' && (
            <div className="space-y-6">
              {/* Shaparak Mock Header */}
              <div className="p-4 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl text-white flex items-center justify-between shadow-md">
                <div>
                  <div className="text-[11px] opacity-90">شبکه الکترونیکی پرداخت کارت (شاپرک)</div>
                  <div className="font-extrabold text-base">درگاه پرداخت اینترنتی {gateway === 'zarinpal' ? 'زرین‌پال' : 'شاپرک بانکی'}</div>
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <Clock className="w-4 h-4 text-amber-200" />
                  <span>۰۹:۵۴</span>
                </div>
              </div>

              {/* Order Info in Gateway */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>پذیرنده:</span>
                  <span className="font-bold text-slate-800">داروخانه آنلاین سلامت (دکتر خیرخواه)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>شماره پذیرنده (Terminal ID):</span>
                  <span className="font-mono text-slate-800">۹۸۴۲۱۱۰۴</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>مبلغ فاکتور:</span>
                  <span className="text-emerald-700 font-extrabold">{formatPrice(finalAmount)}</span>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">شماره کارت بانکی (عضو شتاب)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono tracking-widest text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">کد شناسایی دوم (CVV2)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cvv2}
                      onChange={(e) => setCvv2(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">رمز پویا (یکبار مصرف پیامکی)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => alert('رمز پویا مجدداً پیامک شد: ۸۴۹۲۰۱')}
                        className="bg-amber-100 text-amber-900 text-[10px] px-2.5 rounded-xl font-bold whitespace-nowrap"
                      >
                        دریافت رمز پویا
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="p-3 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                >
                  انصراف و بازگشت
                </button>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span>در حال اتصال و تایید تراکنش شاپرک...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>پرداخت موفق آزمایشی</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-400">
                این درگاه پرداخت به صورت محیط تست Sandbox شاپرک شبیه‌سازی شده است.
              </div>
            </div>
          )}

          {/* STEP 3: Receipt & Confirmation */}
          {step === 'receipt' && completedOrder && (
            <div className="space-y-6 text-center">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  پرداخت با موفقیت انجام و سفارش ثبت شد!
                </h3>
                <p className="text-xs text-slate-500">
                  داروخانه سلامت در حال آماده‌سازی و بسته‌بندی مرسوله شما می‌باشد.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 text-right">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">شماره سفارش داروخانه:</span>
                  <span className="font-bold text-slate-800 font-mono">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">کد مرجع تراکنش بانکی (RefID):</span>
                  <span className="font-bold text-emerald-700 font-mono">{completedOrder.bankRefId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">روش ارسال:</span>
                  <span className="font-bold text-slate-800">{currentShippingMethod.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">کد رهگیری مرسوله:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{completedOrder.shippingTrackingCode}</span>
                    <button
                      onClick={() => {
                        if (completedOrder.shippingTrackingCode) {
                          navigator.clipboard.writeText(completedOrder.shippingTrackingCode);
                          setCopiedTracking(true);
                          setTimeout(() => setCopiedTracking(false), 2000);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="کپی کد رهگیری"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedTracking && <span className="text-[10px] text-emerald-600">کپی شد!</span>}
                  </div>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">مبلغ پرداخت شده:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">{formatPrice(completedOrder.finalAmount)}</span>
                </div>
              </div>

              {/* Items Purchased List */}
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800 mb-2">اقلام فاکتور شده:</div>
                <div className="space-y-2">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <img src={it.image} alt={it.productName} className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-medium text-slate-800">{it.productName}</span>
                      </div>
                      <div className="text-slate-600">
                        {toPersianDigits(it.quantity)} عدد · {formatPrice(it.priceAtPurchase * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ فاکتور رسمی</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  بازگشت به فروشگاه
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
