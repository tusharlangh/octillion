"use client";

import Image from "next/image";
import { Search, PanelRightOpen } from "lucide-react";
import { Libre_Baskerville } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function TopLevel() {
  return (
    <div className="flex justify-between items-center px-2">
      <div className="flex gap-1 items-center cursor-pointer hover:scale-105 transition-all duration-200 group">
        <Image
          alt="octillion-logo"
          src={"/octillion_logo.svg"}
          height={16}
          width={16}
          className="group-hover:-rotate-8 transition-transform duration-200 dark:invert"
        />
        <p
          className={`${libreBaskerville.className} font-bold text-[16px] pt-0.5 text-neutral-900 dark:text-white transition-colors duration-200`}
        >
          Octillion
        </p>
      </div>
      <div className="flex gap-3">
        <Search
          className="text-neutral-400 dark:text-neutral-500 cursor-pointer 
                     hover:text-neutral-900 dark:hover:text-white 
                     transition-colors duration-200"
          height={18}
          width={18}
        />
        <PanelRightOpen
          className="text-neutral-400 dark:text-neutral-500 cursor-pointer 
                     hover:text-neutral-900 dark:hover:text-white 
                     transition-colors duration-200"
          height={18}
          width={18}
        />
      </div>
    </div>
  );
}
