import type { Metadata } from "next";
import { DM_Sans, Do_Hyeon } from "next/font/google";
import "./globals.css";

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
      <body className={`${dmSans.variable} ${doHyeon.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
