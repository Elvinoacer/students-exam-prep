"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { Download, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ToastType = "loading" | "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => string;
  updateToast: (id: string, message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType): string => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (type !== "loading") {
      setTimeout(() => removeToast(id), 5000);
    }
    return id;
  };

  const updateToast = (id: string, message: string, type: ToastType) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, type } : t))
    );
    if (type !== "loading") {
      setTimeout(() => removeToast(id), 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, updateToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in slide-in-from-right-5 fade-in duration-300 ${
              toast.type === "loading"
                ? "bg-gray-900/90 border-white/10 text-white"
                : toast.type === "success"
                ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-100"
                : "bg-red-900/90 border-red-500/30 text-red-100"
            }`}
          >
            {toast.type === "loading" && (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            )}
            {toast.type === "success" && (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
