"use client";

import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { motion } from "framer-motion";
import { DM_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import SurfingLoading from "../animations/surfingLoading";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { useRouter } from "next/navigation";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

interface DocumentDropdownProps {
  setSelectedDoc: (doc: { name: string; parse_id: string }) => void;
  onClose: () => void;
}

export default function DocumentDropdown({
  setSelectedDoc,
  onClose,
}: DocumentDropdownProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSelectedIndex(0);
  }, [data]);

  useEffect(() => {
    async function GET() {
      setLoading(true);
      try {
        const jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-view-files/`,
          {
            method: "GET",
            headers: {
              method: "application/json",
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          const errorMessage =
            data.error?.message ||
            data.error ||
            getErrorMessageByStatus(res.status);

          console.error("Document dropdown failed:", {
            status: res.status,
            error: errorMessage,
            details: data.error?.details,
          });

          setError(errorMessage);

          if (res.status === 401 || res.status === 403) {
            setTimeout(() => router.replace("/login"), 2000);
          }

          return;
        }

        setData(data.data);
      } catch (error) {
        console.error("Document dropdown error: ", error);

        if (error instanceof TypeError && error.message.includes("fetch")) {
          setError("Network error. Please check your connection.");
        } else if (error instanceof Error && error.message.includes("token")) {
          setError("Authentication failed. Please log in again.");
          setTimeout(() => router.replace("/login"), 2000);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }

    GET();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || data.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && data.length > 0) {
        e.preventDefault();
        const selectedDoc = data[selectedIndex];
        if (selectedDoc) {
          setSelectedDoc({
            name: selectedDoc.name,
            parse_id: selectedDoc.parse_id,
          });
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, selectedIndex, loading, setSelectedDoc, onClose]);

  if (loading) {
    return (
      <motion.div
        ref={dropdownRef}
        className="min-w-[200px] w-64 rounded-lg bg-[rgb(242,242,242)] dark:bg-white/5 border border-[rgb(218,218,218)] dark:border-white/10 transition-colors duration-200 shadow-lg p-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="w-full h-full">
          <SurfingLoading />
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        ref={dropdownRef}
        className="min-w-[200px] w-64 rounded-lg bg-[rgb(242,242,242)] dark:bg-white/5 border border-[rgb(218,218,218)] dark:border-white/10 transition-colors duration-200 shadow-lg p-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="p-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
          No documents found
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={dropdownRef}
      className="min-w-[200px] w-64 max-h-60 overflow-y-auto rounded-lg bg-[rgb(242,242,242)] dark:bg-white/5 border border-[rgb(218,218,218)] dark:border-white/10 transition-colors duration-200 shadow-lg p-1"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <ul className="w-full">
        {data.map((item, i) => (
          <li
            key={item.id}
            data-document-item
            className={`w-full px-2 py-1.5 rounded-[4px] cursor-pointer transition-colors duration-200 ${
              i === selectedIndex
                ? "bg-black/10 dark:bg-white/10"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            onClick={() =>
              setSelectedDoc({ name: item.name, parse_id: item.parse_id })
            }
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <p
              className={`${dmSans.className} truncate text-sm text-black/80 dark:text-white/80`}
            >
              {item.name}
            </p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
