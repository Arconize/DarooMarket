// Persian number formatting utilities
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatPrice(price: number): string {
  const formatted = price.toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('fa-IR');
}

export function calculateDiscountPercent(price: number, discountPrice?: number): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}
