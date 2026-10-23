import React from 'react';
import { Pill, ShieldCheck, PhoneCall, MapPin, Clock, Award, FileText, CheckCircle2 } from 'lucide-react';
import { toPersianDigits } from '../utils/formatters';

interface FooterProps {
  onOpenPrescription: () => void;
  onOpenBackendDoc: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrescription, onOpenBackendDoc }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Pill className="w-6 h-6" />
              </div>
              <span className="font-black text-xl text-white">داروخانه آنلاین سلامت</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              داروخانه شبانه‌روزی دکتر حسینی با پروانه تاسیس رسمی از دانشگاه علوم پزشکی تهران و مجوز فروش اینترنتی فرآورده‌های سلامت‌محور، مکمل‌های رژیمی، ورزشی، آرایشی بهداشتی و ارتوپدی.
            </p>

            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۱۲</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>پشتیبانی شبانه‌روزی: {toPersianDigits('021-88990022')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ساعات کار داروخانه: ۲۴ ساعته در ۷ روز هفته</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenPrescription} className="hover:text-emerald-400 transition-colors">
                  ارسال و بررسی نسخه پزشک
                </button>
              </li>
              <li>
                <button onClick={onOpenBackendDoc} className="hover:text-emerald-400 transition-colors">
                  معماری و مستندات سرور FastAPI
                </button>
              </li>
              <li>
                <a href="#supplements" className="hover:text-emerald-400 transition-colors">
                  مکمل‌های بدنسازی و ورزشی
                </a>
              </li>
              <li>
                <a href="#skin-hair" className="hover:text-emerald-400 transition-colors">
                  محصولات مراقبت پوست و مو
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  سوالات متداول و رویه ارسال سفارش
                </a>
              </li>
            </ul>
          </div>

          {/* Legal rules */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">قوانین و استعلام اصالت کالا</h4>
            <div className="text-xs text-slate-400 space-y-2.5 leading-relaxed">
              <p>
                تمامی مکمل‌ها و فرآورده‌های سلامت‌محور دارای برچسب اصالت کالا (تی‌تک TTAC) و کد IRC معتبر سازمان غذا و دارو می‌باشند.
              </p>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300">
                <strong className="text-emerald-400 block mb-1">هشدار مصرف دارویی:</strong>
                اطلاعات موجود در سایت جایگزین توصیه پزشک معالج نیست. مصرف داروهای تخصصی تنها با تجویز پزشک مجاز است.
              </div>
            </div>
          </div>

          {/* Electronic Seals & Badges */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white">نمادها و مجوزهای قانونی</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
                <span className="font-bold text-[11px] text-white block">اینماد الکترونیکی</span>
                <span className="text-[10px] text-slate-400 block">پنج ستاره تایید شده</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <Award className="w-6 h-6 text-amber-400 mx-auto" />
                <span className="font-bold text-[11px] text-white block">پروانه وزارت بهداشت</span>
                <span className="text-[10px] text-slate-400 block">سازمان غذا و دارو</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-blue-400 mx-auto" />
                <span className="font-bold text-[11px] text-white block">نشان ساماندهی</span>
                <span className="text-[10px] text-slate-400 block">رسانه‌های دیجیتال</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <FileText className="w-6 h-6 text-purple-400 mx-auto" />
                <span className="font-bold text-[11px] text-white block">درگاه امن شاپرک</span>
                <span className="text-[10px] text-slate-400 block">زرین‌پال / به‌پرداخت</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          تمامی حقوق این سامانه متعلق به داروخانه آنلاین سلامت (دکتر حسینی) می‌باشد. طراحی و معماری منطبق با استانداردهای Next.js و FastAPI.
        </div>

      </div>
    </footer>
  );
};
