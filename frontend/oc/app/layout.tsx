import type { Metadata } from "next";
import { DM_Sans, Do_Hyeon } from "next/font/google";
import "./globals.css";
import SideBarManager from "@/components/sideBarManager/sideBarManager";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
});

const doHyeon = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-do_hyeon",
});

export const metadata: Metadata = {
  title: "Octillion",
  description: "Upload and search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${dmSans.variable} ${doHyeon.variable}`}>
        <div className="h-[100vh] w-[100vw] bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] pt-2 pl-4 flex">
          <section className="max-w-[250px] w-full">
            <SideBarManager />
          </section>
          <div className="w-full pl-4">{children}</div>
          <div id="modal-root"></div>
        </div>
      </body>
    </html>
  );
}
