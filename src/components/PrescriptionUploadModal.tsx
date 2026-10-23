import React, { useState } from 'react';
import { X, Upload, FileText, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PrescriptionRequest } from '../types/pharmacy';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrescription: (pres: PrescriptionRequest) => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitPrescription
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [insuranceType, setInsuranceType] = useState<'tamin' | 'salamat' | 'armed_forces' | 'free'>('tamin');
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const trackId = `RX-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPrescription: PrescriptionRequest = {
      id: `pres-${Date.now()}`,
      patientName,
      patientPhone,
      nationalCode,
      insuranceType,
      prescriptionImage: imagePreview,
      notes,
      status: 'pending_review',
      createdAt: new Date().toLocaleDateString('fa-IR')
    };

    onSubmitPrescription(newPrescription);
    setTrackingNumber(trackId);
    setIsSubmitted(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-sm sm:text-base text-slate-800">
              سامانه ارسال و مشاوره نسخه پزشک داروخانه
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                نسخه شما با موفقیت به دست داروساز مسئول رسید!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                کد رهگیری نسخه شما <strong className="font-mono text-emerald-700 font-bold">{trackingNumber}</strong> می‌باشد. دکتر داروساز داروخانه پس از استعلام بیمه و بررسی موجودی اقلام دارویی ظرف حداکثر ۳۰ دقیقه با شماره <strong className="font-mono">{patientPhone}</strong> تماس خواهد گرفت.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                متوجه شدم و بستن
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  طبق ضوابط سازمان غذا و دارو، تحویل داروهای تخصصی نسخه‌ای پس از رویت نسخه اصلی یا استعلام کد رهگیری نسخه الکترونیک تامین اجتماعی و بیمه سلامت انجام می‌گیرد.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">نام و نام خانوادگی بیمار</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثلاً: محمد رضایی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">شماره همراه تماس</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="۰۹xxxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">کد ملی بیمار (اختیاری جهت استعلام الکترونیک)</label>
                  <input
                    type="text"
                    value={nationalCode}
                    onChange={(e) => setNationalCode(e.target.value)}
                    placeholder="۱۰ رقم بدون خط تیره"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">نوع پوشش بیمه</label>
                  <select
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                  >
                    <option value="tamin">بیمه تامین اجتماعی</option>
                    <option value="salamat">بیمه سلامت ایرانیان</option>
                    <option value="armed_forces">بیمه نیروهای مسلح</option>
                    <option value="free">بیمه آزاد (بدون بیمه)</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">بارگذاری تصویر نسخه پزشک</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-slate-50">
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img src={imagePreview} alt="پیش‌نمایش نسخه" className="h-32 object-contain mx-auto rounded-lg border border-slate-200" />
                      <label className="inline-block text-xs text-emerald-700 font-semibold cursor-pointer hover:underline">
                        تغییر عکس نسخه
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-slate-700 block">انتخاب تصویر نسخه از گالری یا دوربین</span>
                      <span className="text-[10px] text-slate-400">فرمت‌های JPG، PNG تا سقف ۱۰ مگابایت</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">توضیحات و نیازمندی‌ها برای داروساز</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اگر حساسیت دارویی دارید یا مارک و برند خاصی مد نظر شماست، اینجا بنویسید..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-emerald-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer"
              >
                ارسال نسخه جهت بررسی داروساز
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
