export type ProductCategory = 
  | 'supplements'       // مکمل‌های غذایی و رژیمی
  | 'sports'            // مکمل‌های ورزشی و بدنسازی
  | 'skin-hair'         // مراقبت پوست، مو و زیبایی
  | 'baby-mom'          // مادر و کودک
  | 'medical-devices'   // تجهیزات پزشکی و ارتوپدی
  | 'hygiene-intimate'  // بهداشت شخصی و زناشویی
  | 'otc-medicines';     // داروهای بدون نسخه و تسکین‌دهنده

export interface Product {
  id: string;
  name: string;              // نام فارسی کالا
  englishName: string;       // نام انگلیسی
  slug: string;
  category: ProductCategory;
  subcategory: string;
  brand: string;
  price: number;             // قیمت اصلی به تومان
  discountPrice?: number;    // قیمت ویژه/تخفیف دار
  stock: number;             // موجودی انبار
  ircCode: string;           // شناسه ثبت دارو و فرآورده سازمان غذا و دارو (IRC)
  sku: string;               // شناسه انبار
  description: string;       // توضیحات کامل
  shortDescription: string;
  usageInstructions: string; // دستور و نحوه مصرف
  ingredients: string[];     // ترکیبات اصلی
  dosageForm: string;        // فرم دارویی (قرص، کپسول، ساشه، کرم و ...)
  countryOfOrigin: string;   // کشور سازنده
  image: string;             // تصویر اصلی
  images?: string[];         // تصاویر گالری
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isSpecialOffer?: boolean;
  requiresPrescription?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userPhoneMasked: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
  adminReply?: string;
  purchaseVerified: boolean;
}

export type ShippingMethodId = 'alopeyk' | 'snappbox' | 'iranpost' | 'tipax';

export interface ShippingMethod {
  id: ShippingMethodId;
  name: string;
  provider: string;
  estimatedTime: string;
  baseCost: number;
  description: string;
  availableCities: string[]; // مثلاً الوپیک و اسنپ‌باکس فقط تهران و کرج
}

export interface Address {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  postalAddress: string;
  postalCode: string;
}

export type OrderStatus = 
  | 'pending_payment'      // در انتظار پرداخت
  | 'paid'                 // پرداخت موفق
  | 'preparing'            // در حال بسته‌بندی در داروخانه
  | 'shipped'              // تحویل به پیک / شرکت پست
  | 'delivered'            // تحویل داده شد
  | 'canceled';            // لغو شده

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: {
    productId: string;
    productName: string;
    priceAtPurchase: number;
    quantity: number;
    image: string;
  }[];
  totalProductsPrice: number;
  shippingCost: number;
  discountAmount: number;
  finalAmount: number;
  shippingMethod: ShippingMethodId;
  shippingTrackingCode?: string;
  paymentGateway: 'zarinpal' | 'saman' | 'mellat';
  bankRefId?: string;
  address: Address;
}

export interface PrescriptionRequest {
  id: string;
  patientName: string;
  patientPhone: string;
  nationalCode: string;
  insuranceType: 'tamin' | 'salamat' | 'armed_forces' | 'free';
  prescriptionImage: string;
  notes: string;
  status: 'pending_review' | 'pricing' | 'approved' | 'rejected';
  pharmacistNotes?: string;
  createdAt: string;
}

export interface UserSession {
  phone: string;
  name?: string;
  role: 'customer' | 'admin' | 'pharmacist';
  token?: string;
}
