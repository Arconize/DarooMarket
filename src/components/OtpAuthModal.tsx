import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, KeyRound, CheckCircle2, User, ArrowRight } from 'lucide-react';
import { UserSession } from '../types/pharmacy';
import { toPersianDigits } from '../utils/formatters';

interface OtpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
}

export const OtpAuthModal: React.FC<OtpAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [countdown, setCountdown] = useState(120);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let timer: any;
    if (step === 'code' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('09') || phone.length < 11) {
      setErrorMsg('شماره موبایل وارد شده باید ۱۱ رقم و با ۰۹ شروع شود.');
      return;
    }
    setErrorMsg('');
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedCode(newCode);
    setStep('code');
    setCountdown(120);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== generatedCode && code !== '1234') {
      setErrorMsg('کد وارد شده نامعتبر است. لطفاً کد نمایش داده شده را وارد فرمایید.');
      return;
    }
    setErrorMsg('');
    const session: UserSession = {
      phone,
      name: role === 'admin' ? 'دکتر م. حسینی (مسئول فنی)' : 'کاربر گرامی داروخانه',
      role: role === 'admin' ? 'pharmacist' : 'customer',
      token: `jwt_token_${Date.now()}`
    };
    onLoginSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-sm sm:text-base text-slate-800">
              {currentUser ? 'پروفایل کاربری' : 'ورود / ثبت‌نام با پیامک یکبار مصرف (OTP)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-black">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser.phone}</p>
                <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                  نقش: {currentUser.role === 'pharmacist' ? 'دکتر داروساز و مسئول فنی' : 'مشتری داروخانه'}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex gap-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  خروج از حساب کاربری
                </button>
              </div>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                شماره موبایل خود را وارد کنید. کد تایید یکبار مصرف ۴ رقمی جهت احراز هویت برای شما ارسال می‌شود.
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">شماره تلفن همراه</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-emerald-600 font-mono text-left tracking-wider"
                  dir="ltr"
                />
              </div>

              {/* Role selector for test ease */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">ورود آزمایشی با نقش:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      role === 'customer'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    مشتری عادی
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      role === 'admin'
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    دکتر داروساز (ادمین)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                دریافت کد تایید یکبار مصرف (SMS)
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed flex items-center justify-between">
                <span>کد تایید به شماره {phone} پیامک شد.</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-emerald-700 text-[11px] font-bold hover:underline"
                >
                  ویرایش شماره
                </button>
              </div>

              {/* Test Helper Notification banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">پیامک شبیه‌سازی شده:</span>
                  <div className="text-[11px] text-emerald-700 mt-0.5">
                    کد تایید داروخانه سلامت: <strong className="font-mono text-sm font-black">{generatedCode}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCode(generatedCode)}
                  className="text-[10px] bg-emerald-700 text-white px-2 py-1 rounded-md font-bold"
                >
                  درج خودکار کد
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">کد ۴ رقمی تایید</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="----"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-mono text-center tracking-[1em] focus:outline-emerald-600"
                  dir="ltr"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>مدت زمان اعتبار کد:</span>
                <span className="font-mono font-bold text-slate-800">
                  {toPersianDigits(Math.floor(countdown / 60))}:{toPersianDigits(String(countdown % 60).padStart(2, '0'))}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                تایید و ورود به سامانه
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
