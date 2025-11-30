"use client";

import { DM_Sans } from "next/font/google";
import React, { useContext, useEffect, useRef, useState } from "react";
import { chatContext } from "./charManger";
import { ArrowUp } from "lucide-react";
import { Libre_Baskerville } from "next/font/google";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import DocumentDropdown from "./documentDropdown";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { useRouter } from "next/navigation";
import { SidebarContext } from "../ConditionalLayout";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function ChatInput() {
  const context = useContext(chatContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isOpenedDropdown, setIsOpenedDropdown] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<{
    name: string;
    parse_id: string;
  } | null>(null);

  const sidebarContext = useContext(SidebarContext);
  if (!sidebarContext) throw new Error("SidebarContext is not working");
  const { setNotis } = sidebarContext;
  const router = useRouter();

  useEffect(() => {
    if (selectedDoc) {
      const lastIndex = search.lastIndexOf("@");
      const before = search.substring(0, lastIndex);
      setSearch(before + "@" + selectedDoc?.name + " ");
      setIsOpenedDropdown(false);
    }
  }, [selectedDoc]);

  if (!context)
    throw new Error("chatContext in ChatInput component is not working");

  const { search, setSearch, isLoading, setIsLoading, setMessages, messages } =
    context;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (newValue.length > 0 && !newValue.startsWith("@")) {
      return;
    }

    if (selectedDoc) {
      const expectedStart = `@${selectedDoc.name} `;
      if (!newValue.startsWith(expectedStart)) {
        setSelectedDoc(null);
      }
    }

    const cursorPos = textareaRef.current?.selectionStart || newValue.length;
    const textBeforeCursor = newValue.substring(0, cursorPos);

    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const shouldShow =
      lastAtIndex === 0 &&
      !textBeforeCursor.includes(" ", 1) &&
      !textBeforeCursor.includes("\n");

    if (shouldShow) {
      setIsOpenedDropdown(true);
    } else if (isOpenedDropdown) {
      setIsOpenedDropdown(false);
    }

    setSearch(newValue);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const handleSend = async () => {
    if (!search.trim()) {
      setNotis({ message: "Search is empty", type: "error" });
      return;
    }

    if (!selectedDoc || !selectedDoc.name || !selectedDoc.parse_id) {
      setNotis({ message: "Please select a doc by typing @", type: "error" });
      return;
    }

    const parseId = selectedDoc?.parse_id;
    const userMessage = search.trim();

    if (!parseId) {
      setNotis({ message: "Parse id not found", type: "error" });
      return;
    }

    setMessages([...messages, { content: userMessage, role: "user" }]);
    setIsLoading(true);
    setSearch("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const jwt = await handleTokenAction();
      if (!jwt) {
        throw new Error("Failed to get authentication token");
      }

      const query = new URLSearchParams({
        id: parseId!,
        search: userMessage.replace(selectedDoc?.name!, ""),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-chats/?${query}`,
        {
          method: "GET",
          headers: {
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

        console.error("Chat failed:", {
          status: res.status,
          error: errorMessage,
          details: data.error?.details,
        });

        setNotis({ message: errorMessage, type: "error" });

        if (res.status === 401 || res.status === 403) {
          setTimeout(() => router.replace("/login"), 2000);
        }

        return;
      }

      setMessages((prev) => [
        ...prev,
        { content: data.response, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Search error: ", error);

      setMessages((prev) => [
        ...prev,
        {
          content: "Sorry, I encountered an error. Please try again.",
          role: "assistant",
        },
      ]);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        setNotis({
          message: "Network error. Please check your connection.",
          type: "error",
        });
      } else if (error instanceof Error && error.message.includes("token")) {
        setNotis({
          message: "Authentication failed. Please log in again.",
          type: "error",
        });
        setTimeout(() => router.replace("/login"), 2000);
      } else {
        setNotis({
          message: "An unexpected error occurred. Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isOpenedDropdown) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section
      ref={sectionRef}
      className="w-full flex justify-center pb-4 md:pb-10 max-w-full md:max-w-[80%] lg:max-w-[60%] mx-auto relative px-2 md:px-0"
    >
      <div
        ref={containerRef}
        className="flex items-center pt-4 gap-2 px-3 md:px-4 py-2 w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-colors duration-200 rounded-lg shadow-lg"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder="Type @ to select a document..."
            className={`${libreBaskerville.className} w-full
                     border-0 bg-transparent
                     text-[16px] outline-none 
                     placeholder:text-black/40 dark:placeholder:text-white/40
                     text-black/80 dark:text-white/80
                     resize-none overflow-y-auto
                     max-h-[200px]
                     transition-colors duration-200
                     scrollbar-thin scrollbar-track-transparent
                     scrollbar-thumb-neutral-300 hover:scrollbar-thumb-neutral-400
                     dark:scrollbar-thumb-neutral-700 dark:hover:scrollbar-thumb-neutral-600`}
            value={search}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center mb-1">
          <button
            onClick={handleSend}
            disabled={!search.trim() || isLoading}
            className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full
                     flex items-center justify-center
                     transition-all duration-200
                     ${
                       search.trim() && !isLoading
                         ? "bg-black hover:bg-black/70 dark:bg-white dark:hover:bg-white/70 text-white cursor-pointer"
                         : "bg-neutral-300 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                     }`}
            title="Send message"
          >
            <ArrowUp
              className={`w-4 h-4 ${
                search.trim() && !isLoading
                  ? "text-white dark:text-black"
                  : "text-neutral-400 dark:text-neutral-600"
              }`}
            />
          </button>
        </div>
      </div>
      {isOpenedDropdown && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-max max-w-full px-2 md:px-0">
          <DocumentDropdown
            setSelectedDoc={setSelectedDoc}
            onClose={() => {
              setIsOpenedDropdown(false);
            }}
          />
        </div>
      )}


    </section>
  );
}
