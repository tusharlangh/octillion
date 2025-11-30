"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface NotisManagerProps {
  message: string;
  type: string;
  duration: number;
  onDismiss?: () => void;
}

export default function NotisManager({
  message,
  type,
  duration = 5000,
  onDismiss,
}: NotisManagerProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-200",
          icon: "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200",
        };
      case "info":
        return {
          bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-200",
          icon: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200",
        };
      case "error":
      default:
        return {
          bg: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
          text: "text-red-800 dark:text-red-200",
          icon: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200",
        };
    }
  };

  const styles = getStyles();

  return (
    <div>
      {show && (
        <div className="w-full flex items-center justify-center absolute top-6 z-100 transform animate-in fade-in slide-in-from-top-4">
          <div
            className={`
            flex items-center justify-center 
            rounded-lg px-6 py-4
            border shadow-lg gap-2
            ${styles.bg}
          `}
          >
            <p className={`text-md font-medium ${styles.text}`}>{message}</p>
            <X
              className={`cursor-pointer transition-colors duration-200 ${styles.icon}`}
              height={14}
              width={14}
              onClick={handleDismiss}
            />
          </div>
        </div>
      )}
    </div>
  );
}
