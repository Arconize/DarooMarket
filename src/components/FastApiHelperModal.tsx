import React, { useState } from 'react';
import { X, Code2, Copy, Check, Terminal, AlertTriangle, FileCode, FolderTree, BookOpen } from 'lucide-react';
import { FASTAPI_CODEBASE } from '../data/fastApiCodeSnippets';

interface FastApiHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastApiHelperModal: React.FC<FastApiHelperModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedBash, setCopiedBash] = useState(false);

  if (!isOpen) return null;

  const currentFile = FASTAPI_CODEBASE[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const bashFixScript = `# ۱. ورود به پوشه ریشه بک‌اند
cd ~/pharmacy-project/backend

# ۲. ایجاد فایل‌های __init__.py برای تبدیل پوشه‌ها به پکیج پایتون
mkdir -p app/routers
touch app/__init__.py
touch app/routers/__init__.py

# ۳. بررسی و اطمینان از نامگذاری جمع پوشه (routers نه router)
ls -la app/

# ۴. اجرای مجدد سرور Uvicorn
uvicorn app.main:app --reload`;

  const handleCopyBash = () => {
    navigator.clipboard.writeText(bashFixScript);
    setCopiedBash(true);
    setTimeout(() => setCopiedBash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-800">
                راهنمای بک‌اند و رفع خطای ModuleNotFoundError در پایتون
              </h2>
              <p className="text-[11px] text-slate-500">
                سورس‌کدهای کامل و بدون نقص FastAPI + PostgreSQL + ساختار استاندارد پکیج پایتون
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Diagnostic Box for the User's Error */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>تحلیل خطای شما: ModuleNotFoundError: No module named 'app.routers'</span>
            </div>
            
            <p className="text-xs text-amber-800 leading-relaxed">
              این خطا زمانی در <strong>Uvicorn</strong> یا پایتون رخ می‌دهد که پوشه <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">routers</code> فاقد فایل <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">__init__.py</code> باشد یا به اشتباه به صورت مفرد <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">router</code> نامگذاری شده باشد یا فایل خارج از پوشه <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">app</code> ساخته شده باشد.
            </p>

            <div className="bg-slate-900 rounded-xl p-3 text-slate-100 text-xs font-mono relative" dir="ltr">
              <button
                onClick={handleCopyBash}
                className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedBash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBash ? 'کپی شد' : 'کپی دستورات'}</span>
              </button>
              <pre className="overflow-x-auto text-[11px]">{bashFixScript}</pre>
            </div>
          </div>

          {/* Code Files Viewer */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>فایل‌های آماده و تست شده بک‌اند پروژه داروخانه:</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedFile ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-indigo-600" />}
                <span>{copiedFile ? 'کد کپی شد!' : `کپی محتوای ${currentFile.filename}`}</span>
              </button>
            </div>

            {/* File Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 mb-3" dir="ltr">
              {FASTAPI_CODEBASE.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors whitespace-nowrap ${
                    selectedFileIndex === idx
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            {/* File Path & Description */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-slate-500">مسیر فایل: </span>
                <span className="font-mono font-bold text-slate-900" dir="ltr">{currentFile.path}</span>
              </div>
              <span className="text-slate-600">{currentFile.description}</span>
            </div>

            {/* Code Content Container */}
            <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto text-slate-100 text-xs font-mono max-h-80" dir="ltr">
              <pre className="leading-relaxed">{currentFile.code}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>توسعه یافته بر پایه FastAPI + SQLAlchemy 2.0 + PostgreSQL برای سیستم‌عامل آرچ لینوکس</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            بستن راهنما
          </button>
        </div>

      </div>
    </div>
  );
};
