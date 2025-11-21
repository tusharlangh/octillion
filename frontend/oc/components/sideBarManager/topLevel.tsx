"use client";

import { PanelLeftClose } from "lucide-react";
import Logo from "../logo";
import { useContext } from "react";
import { SidebarContext } from "../ConditionalLayout";

export default function TopLevel() {
  const context = useContext(SidebarContext);

  if (!context) throw new Error("queryContext is not working");

  const { open, setIsSidebarOpen } = context;

  return (
    <div className="flex justify-between items-center pl-2">
      <Logo />
      <div className="flex gap-3" onClick={() => setIsSidebarOpen(false)}>
        <PanelLeftClose
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
