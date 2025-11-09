"use client";

import { useEffect, useState } from "react";
import AnimatedFileTree from "./AnimatedFileTree";
import TopLevel from "./topLevel";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { SideBarLoading } from "./sideBarLoading";
import Image from "next/image";

export default function SideBarManager() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pfp, setPfp] = useState<string>("");

  useEffect(() => {
    async function GET() {
      try {
        setLoading(true);
        const jwt = await handleTokenAction();

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

        const d = await res.json();
        setData(d.data);
        setLoading(false);

        console.log("Fetched file structure: ", d.data);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    async function GETPFP() {
      try {
        const jwt = await handleTokenAction();

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-pfp`, {
          method: "GET",
          headers: {
            method: "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        const d = await res.json();
        setPfp(d.data);

        console.log("Fetched pfp", d.data);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    GET();
    GETPFP();
  }, []);

  return (
    <div className="flex flex-col justify-between h-full pt-2 transition-colors duration-200">
      <div>
        <TopLevel />
        <div className="bg-neutral-200/80 dark:bg-white/10 w-full h-[1px] my-2 transition-colors duration-200"></div>
        {loading ? (
          <SideBarLoading />
        ) : (
          <div className="w-full">
            <AnimatedFileTree fileStructure={data} />
          </div>
        )}
      </div>
      <div
        className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 
                   hover:bg-neutral-200 dark:hover:bg-neutral-700 
                   rounded-full mb-4 cursor-pointer shrink-0 transition-all duration-200 overflow-hidden
                   flex items-center justify-center"
      >
        {pfp && (
          <Image
            src={pfp}
            alt="Profile picture"
            width={32}
            height={32}
            className="w-full h-full object-cover"
            priority
          />
        )}
      </div>
    </div>
  );
}
