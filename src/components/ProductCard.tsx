import React from 'react';
import { Star, Plus, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../types/pharmacy';
import { formatPrice, toPersianDigits, calculateDiscountPercent } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isAdded?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  isAdded
}) => {
  const discountPercent = calculateDiscountPercent(product.price, product.discountPrice);
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Media Area */}
      <div>
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-3 flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Discount Tag */}
          {discountPercent > 0 && (
            <span className="absolute top-2 right-2 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              {toPersianDigits(discountPercent)}٪ تخفیف
            </span>
          )}

          {/* IRC Authenticity badge */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-emerald-800 text-[10px] font-medium px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>کد IRC معتبر</span>
          </div>
        </div>

        {/* Quiet Unboxed Metadata: Brand & Form */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1.5">
          <span className="font-medium text-emerald-700">{product.brand}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{product.dosageForm}</span>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mb-1">
          {product.name}
        </h3>

        {/* English Name subtitle */}
        <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mb-2.5" dir="ltr">
          {product.englishName}
        </p>
      </div>

      {/* Bottom Rating, Price and Action */}
      <div className="pt-2 border-t border-slate-100">
        
        {/* Rating and Stock text */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{toPersianDigits(product.rating)}</span>
            <span className="text-slate-400">({toPersianDigits(product.reviewCount)})</span>
          </div>

          <div>
            {isOutOfStock ? (
              <span className="text-rose-500 font-medium">ناموجود</span>
            ) : product.stock < 10 ? (
              <span className="text-amber-600 font-medium">تنها {toPersianDigits(product.stock)} عدد در انبار</span>
            ) : (
              <span className="text-slate-400">موجود در انبار</span>
            )}
          </div>
        </div>

        {/* Pricing & Add Button */}
        <div className="flex items-center justify-between gap-2">
          <div>
            {product.discountPrice ? (
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  {formatPrice(product.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => onAddToCart(product, e)}
            disabled={isOutOfStock}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600'
            }`}
            title="افزودن به سبد خرید"
          >
            {isAdded ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
