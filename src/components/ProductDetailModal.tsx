import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Star, 
  Truck, 
  CheckCircle2, 
  Pill, 
  Sparkles, 
  Building2, 
  Plus, 
  Minus, 
  ShoppingBag,
  MessageSquare,
  CornerDownLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Product, Review } from '../types/pharmacy';
import { formatPrice, toPersianDigits, calculateDiscountPercent } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  reviews: Review[];
  onSubmitReview: (productId: string, rating: number, comment: string, name: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  reviews,
  onSubmitReview
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'instructions' | 'ingredients' | 'reviews'>('info');

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!product) return null;

  const currentImage = selectedImage || product.image;
  const discountPercent = calculateDiscountPercent(product.price, product.discountPrice);
  const productReviews = reviews.filter(r => r.productId === product.id && r.isApproved);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newName.trim()) return;
    onSubmitReview(product.id, newRating, newComment, newName);
    setReviewSuccess(true);
    setNewComment('');
    setNewName('');
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-700">{product.brand}</span>
            <span aria-hidden="true">/</span>
            <span>{product.dosageForm}</span>
            <span aria-hidden="true">/</span>
            <span>کد انبار: {product.sku}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gallery Column */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 mb-3 flex items-center justify-center p-4">
                <img 
                  src={currentImage} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Selector */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                        currentImage === img ? 'border-emerald-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="نمای کالا" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Official IRC Badge Box */}
              <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-950 mb-0.5">اصالت فرآورده سلامت‌محور</div>
                  <div className="text-emerald-800 leading-relaxed">
                    شناسه ثبت دارو و فرآورده (IRC): <span className="font-mono font-bold">{product.ircCode}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">
                    تایید شده توسط سازمان غذا و دارو و قابل استعلام در سامانه TTAC
                  </div>
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug mb-1">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-400 font-sans mb-3" dir="ltr">
                  {product.englishName}
                </p>

                {/* Rating & Reviews overview */}
                <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{toPersianDigits(product.rating)}</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{toPersianDigits(productReviews.length || product.reviewCount)} دیدگاه ثبت شده</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-emerald-600 font-medium">ساخت {product.countryOfOrigin}</span>
                </div>

                {/* Short description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {product.shortDescription || product.description}
                </p>

                {/* Attributes Table */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs mb-6">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">برند سازنده:</span>
                    <span className="font-bold text-slate-800">{product.brand}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">فرم دارویی:</span>
                    <span className="font-semibold text-slate-800">{product.dosageForm}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">کشور مبدا:</span>
                    <span className="font-semibold text-slate-800">{product.countryOfOrigin}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">وضعیت موجودی انبار:</span>
                    <span className={`font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {product.stock > 0 ? `موجود (${toPersianDigits(product.stock)} عدد)` : 'اتمام موجودی'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Add to Cart Footer */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">قیمت مصرف‌کننده:</span>
                  <div className="text-left">
                    {product.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-lg font-black text-emerald-700">
                          {formatPrice(product.discountPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                {product.stock > 0 ? (
                  <div className="flex items-center gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs">
                        {toPersianDigits(quantity)}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(product, quantity);
                        onClose();
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>افزودن به سبد خرید ({formatPrice((product.discountPrice || product.price) * quantity)})</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-500">
                    این کالا در حال حاضر ناموجود است
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Tabbed details area */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  activeTab === 'info'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                توضیحات تکمیلی
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  activeTab === 'instructions'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                روش و دستور مصرف
              </button>
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  activeTab === 'ingredients'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ترکیبات دارویی
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                نظرات و پرسش‌ها ({toPersianDigits(productReviews.length)})
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'info' && (
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}

              {activeTab === 'instructions' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    دستور و نحوه مصرف داروساز:
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {product.usageInstructions}
                  </p>
                  <div className="text-amber-800 text-[11px] pt-2 border-t border-slate-200 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    در دوران بارداری، شیردهی یا در صورت مصرف همزمان سایر داروها، با داروساز یا پزشک مشورت نمایید.
                  </div>
                </div>
              )}

              {activeTab === 'ingredients' && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 mb-2">فرمولاسیون و ریزمغذی‌ها:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews list */}
                  {productReviews.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      هنوز دیدگاهی برای این کالا ثبت نشده است. اولین نفری باشید که نظر خود را ثبت می‌کنید!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {productReviews.map((rev) => (
                        <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{rev.userName}</span>
                              {rev.purchaseVerified && (
                                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-medium">
                                  خریدار کالا
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{toPersianDigits(rev.rating)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {rev.comment}
                          </p>

                          {/* Pharmacist Reply */}
                          {rev.adminReply && (
                            <div className="mt-2.5 p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-1">
                              <div className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px]">
                                <CornerDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                                پاسخ دکتر داروساز داروخانه:
                              </div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                {rev.adminReply}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add review form */}
                  <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      ثبت نظر یا پرسش درباره این دارو / مکمل
                    </div>

                    {reviewSuccess && (
                      <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-medium">
                        دیدگاه شما با موفقیت ثبت شد و پس از بررسی و تایید داروساز منتشر خواهد شد.
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">نام شما</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="مثلاً: علی رضایی"
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">امتیاز شما</label>
                        <select
                          value={newRating}
                          onChange={(e) => setNewRating(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-emerald-600"
                        >
                          <option value="5">۵ ستاره - عالی</option>
                          <option value="4">۴ ستاره - خیلی خوب</option>
                          <option value="3">۳ ستاره - متوسط</option>
                          <option value="2">۲ ستاره - ضعیف</option>
                          <option value="1">۱ ستاره - بسیار ضعیف</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">متن نظر یا تجربه مصرف</label>
                      <textarea
                        required
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="تجربه خود از اثرگذاری، طعم یا نحوه مصرف این محصول را بنویسید..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-emerald-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      ارسال نظر جهت بررسی
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
