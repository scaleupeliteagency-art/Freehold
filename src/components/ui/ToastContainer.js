"use client";

import useToastStore from "@/lib/store/useToastStore";
import { useEffect, useState } from "react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let style = "bg-paper border-ink text-ink";
        if (toast.type === 'error') style = "bg-red-50 border-red-800 text-red-900";
        if (toast.type === 'success') style = "bg-moss/10 border-moss text-moss";
        
        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 border shadow-sm animate-in slide-in-from-right-8 fade-in duration-300 min-w-[300px] ${style}`}
          >
            <div className="text-sm font-semibold tracking-wide">{toast.message}</div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 opacity-50 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
