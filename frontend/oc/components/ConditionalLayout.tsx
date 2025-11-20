"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, createContext } from "react";
import SideBarManager from "./sideBarManager/sideBarManager";
import { PanelLeftClose } from "lucide-react";

export const SidebarContext = createContext<
  { open: boolean; setIsSidebarOpen: (v: boolean) => void } | undefined
>(undefined);

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthPage =
    pathname?.startsWith("/login_signin/login") ||
    pathname?.startsWith("/login_signin/signin") ||
    pathname?.startsWith("/auth/callback");

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

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
      value={{ open: isSidebarOpen, setIsSidebarOpen: setIsSidebarOpen }}
    >
      <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] md:pt-2 md:pl-4 flex relative overflow-hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-10 cursor-pointer bg-[rgb(242,242,242)] p-1.5 rounded-[4px]"
          aria-label="Toggle menu"
        >
          {!isSidebarOpen && (
            <PanelLeftClose
              className="text-neutral-700 dark:text-neutral-300 "
              height={18}
              width={18}
            />
          )}
        </button>

        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <section
          className={`
          fixed md:relative
          top-0 left-0 h-full
          w-[280px] md:max-w-[250px] md:w-full
          bg-[#F5F5F7] dark:bg-[rgb(18,18,18)]
          z-40
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

        <div className="w-full md:pl-4 pt-0 px-0 h-full overflow-hidden">
          {children}
        </div>

        <div id="modal-root"></div>
      </div>
    </SidebarContext.Provider>
  );
}
