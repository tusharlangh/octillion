"use client";

import { Home, Search } from "lucide-react";
import Logo from "../logo";

export default function TopLevel() {
  return (
    <div className="flex justify-between items-center px-2">
      <Logo />
      <div className="flex gap-3">
        <Search
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
