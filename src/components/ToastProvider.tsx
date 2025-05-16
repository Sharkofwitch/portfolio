"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { Toast, ToastType } from "./Toast";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  addedAt: number; // Timestamp when the toast was added
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    position?:
      | "top-right"
      | "top-left"
      | "bottom-right"
      | "bottom-left"
      | "top-center"
      | "bottom-center",
  ) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToasts = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  // Use a ref to track component mount state for effects
  const isMountedRef = useRef(false);

  // Only enable toast functionality after component has mounted
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    setIsReady(true);

    return () => {
      // Mark component as unmounted for cleanup
      isMountedRef.current = false;
      setIsReady(false);
    };
  }, []);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000,
    position:
      | "top-right"
      | "top-left"
      | "bottom-right"
      | "bottom-left"
      | "top-center"
      | "bottom-center" = "top-right",
  ): string => {
    if (!isReady || !isMountedRef.current) {
      console.warn("Toast system not ready yet");
      return "";
    }

    const id = Math.random().toString(36).substring(2, 9);

    // Prevent adding duplicate toasts in quick succession
    if (
      toasts.some(
        (toast) =>
          toast.message === message && Date.now() - toast.addedAt < 2000,
      )
    ) {
      return "";
    }

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        duration,
        position,
        addedAt: Date.now(),
      },
    ]);
    return id;
  };

  const hideToast = (id: string) => {
    if (!isReady || !isMountedRef.current) return;
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Render all active toasts */}
      {isReady && (
        <div className="toast-container pointer-events-none fixed inset-0 z-50">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              position={toast.position}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
