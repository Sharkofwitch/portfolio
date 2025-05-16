"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AiOutlineClose,
  AiOutlineCheckCircle,
  AiOutlineInfoCircle,
  AiOutlineWarning,
} from "react-icons/ai";

export type ToastType = "success" | "info" | "warning" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "top-right",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Use a ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Refs to manage timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const safeSetVisible = (value: boolean) => {
    if (isMountedRef.current) {
      setIsVisible(value);
    }
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      // Clear any outstanding timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  // Handle auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        safeSetVisible(false);

        if (onClose) {
          animationTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && onClose) {
              onClose();
            }
          }, 300);
        }
      }
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [duration, onClose]);

  const handleCloseClick = () => {
    safeSetVisible(false);

    if (onClose) {
      animationTimerRef.current = setTimeout(() => {
        if (isMountedRef.current && onClose) {
          onClose();
        }
      }, 300);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2";
      case "top-right":
      default:
        return "top-4 right-4";
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: <AiOutlineCheckCircle className="text-green-500" size={20} />,
          bgClass: "bg-green-50 dark:bg-green-900/30 border-green-500/30",
        };
      case "warning":
        return {
          icon: <AiOutlineWarning className="text-yellow-500" size={20} />,
          bgClass: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500/30",
        };
      case "error":
        return {
          icon: <AiOutlineClose className="text-red-500" size={20} />,
          bgClass: "bg-red-50 dark:bg-red-900/30 border-red-500/30",
        };
      case "info":
      default:
        return {
          icon: <AiOutlineInfoCircle className="text-blue-500" size={20} />,
          bgClass: "bg-blue-50 dark:bg-blue-900/30 border-blue-500/30",
        };
    }
  };

  const { icon, bgClass } = getTypeStyles();
  const positionClasses = getPositionClasses();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed z-50 ${positionClasses} shadow-lg rounded-lg border backdrop-blur-sm ${bgClass}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center px-4 py-3 min-w-[250px] max-w-md">
            <div className="flex-shrink-0 mr-3">{icon}</div>
            <div className="mr-3 flex-grow">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {message}
              </p>
            </div>
            <button
              onClick={handleCloseClick}
              className="flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <AiOutlineClose size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Context for managing multiple toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string } & ToastProps>>([]);

  const addToast = (props: Omit<ToastProps, "onClose">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [
      ...prev,
      { id, ...props, onClose: () => removeToast(id) },
    ]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>
  );

  return { addToast, removeToast, ToastContainer };
};
