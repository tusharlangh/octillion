"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, createContext } from "react";
import SideBarManager from "./sideBarManager/sideBarManager";
import { PanelLeftOpen } from "lucide-react";
import NotisManager from "./notisMananger/notisManager";

export const SidebarContext = createContext<
  | {
      open: boolean;
      setIsSidebarOpen: (v: boolean) => void;
      sidebarKey: number;
      setSidebarKey: (v: number | ((prev: number) => number)) => void;
      isRefreshing: boolean;
      setIsRefreshing: (v: boolean) => void;
      setNotisMessage: (v: string) => void;
      setNotisType: (v: string) => void;
      setNotis: (v: {
        message: string;
        type: "success" | "info" | "error";
      }) => void;
    }
  | undefined
>(undefined);

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarKey, setSidebarKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notis, setNotis] = useState<{
    message: string;
    type: "success" | "info" | "error";
  }>({ message: "", type: "info" });

  const [notisMessage, setNotisMessage] = useState<string>("");
  const [notisType, setNotisType] = useState<string>("");

  const isAuthPage =
    pathname?.startsWith("/login_signin/login") ||
    pathname?.startsWith("/login_signin/signin") ||
    pathname?.startsWith("/auth/callback");

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  if (isAuthPage) {
    return (
      <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)]">
        {children}
        <div id="modal-root"></div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider
      value={{
        open: isSidebarOpen,
        setIsSidebarOpen: setIsSidebarOpen,
        sidebarKey,
        setSidebarKey,
        isRefreshing,
        setIsRefreshing,
        setNotisMessage,
        setNotisType,
        setNotis,
      }}
    >
      <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] md:pt-2 md:pl-4 flex relative overflow-hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-10 cursor-pointer bg-[rgb(242,242,242)] dark:bg-[rgb(18,18,18)] p-1.5 rounded-[4px]"
          aria-label="Toggle menu"
        >
          {!isSidebarOpen && (
            <PanelLeftOpen
              className="text-neutral-700 dark:text-neutral-300 "
              height={18}
              width={18}
            />
          )}
        </button>

        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <section
          className={`
          fixed md:relative
          top-0 left-0 h-full
          w-[280px] md:max-w-[250px] md:w-full
          bg-[#F5F5F7] dark:bg-[rgb(18,18,18)]
          z-40 border-r border-r-black/8 dark:border-r-white/8 md:border-0
          transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          md:block
        `}
        >
          <div className="h-full pt-4 md:pt-0 px-4 md:px-0">
            <SideBarManager />
          </div>
        </section>

        <div className="w-full h-full overflow-hidden md:pl-4 relative">
          {notis.message !== "" && (
            <NotisManager
              message={notis.message}
              type={notis.type}
              duration={5000}
              onDismiss={() => setNotis({ message: "", type: "info" })}
            />
          )}

          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
