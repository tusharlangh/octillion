"use client";

import { useState, useEffect } from "react";
import Portal from "../portal";
import { X } from "lucide-react";

interface ErrorPopUpProps {
  errorMessage?: string;
  duration?: number;
  onDismiss?: () => void;
  isHome: boolean;
}

export default function ErrorPopUp({
  errorMessage = "An unexpected error occurred. Please try again later.",
  duration = 3000,
  onDismiss,
  isHome = false,
}: ErrorPopUpProps) {
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

  if (!show) return null;

  return (
    <Portal>
      <div
        className="fixed top-6 transform left-1/2 -translate-x-1/2 z-50
                   animate-in fade-in slide-in-from-top-4 duration-200 pl-60"
      >
        <div
          className="bg-white dark:bg-neutral-900 
                     flex items-center justify-center 
                     rounded-lg px-6 py-4
                     border border-neutral-200 dark:border-neutral-800
                     shadow-lg
                     gap-2"
        >
          <p className="text-neutral-800 dark:text-neutral-200 text-md font-medium">
            {isHome
              ? errorMessage
              : errorMessage + " returning you back to home"}
          </p>
          <X
            className="text-neutral-400 dark:text-neutral-500 
                      hover:text-neutral-600 dark:hover:text-neutral-300
                      cursor-pointer transition-colors duration-200"
            height={14}
            width={14}
            onClick={handleDismiss}
          />
        </div>
      </div>
    </Portal>
  );
}
