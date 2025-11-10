"use client";

import { usePathname } from "next/navigation";
import SideBarManager from "./sideBarManager/sideBarManager";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login_signin/login") ||
    pathname?.startsWith("/login_signin/signin") ||
    pathname?.startsWith("/auth/callback");

  if (isAuthPage) {
    return (
      <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)]">
        {children}
        <div id="modal-root"></div>
      </div>
    );
  }

  return (
    <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] pt-2 pl-4 flex">
      <section className="max-w-[250px] w-full">
        <SideBarManager />
      </section>
      <div className="w-full pl-4">{children}</div>
      <div id="modal-root"></div>
    </div>
  );
}
