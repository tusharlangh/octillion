"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AnimatedFileTree from "./AnimatedFileTree";
import TopLevel from "./topLevel";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import { SideBarLoading } from "./sideBarLoading";
import Image from "next/image";
import { Home, MessageCircle } from "lucide-react";
import { getErrorMessageByStatus } from "@/utils/errorHandler/getErrorMessageByStatus";
import { SidebarContext } from "../ConditionalLayout";

export default function SideBarManager() {
  const context = useContext(SidebarContext);

  if (!context) throw new Error("queryContext is not working");

  const { isRefreshing, sidebarKey, setNotis } = context;

  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pfp, setPfp] = useState<string>("");

  const isHomeActive = pathname === "/";
  const isChatsActive = pathname === "/chats";

  useEffect(() => {
    async function GET() {
      setLoading(true);

      try {
        const jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/get-view-files/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
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

          console.error("Fetch file structure failed:", {
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

        setData(data.data || []);
      } catch (error) {
        console.error("File structure error: ", error);

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
        setLoading(false);
      }
    }

    async function GETPFP() {
      setLoading(true);
      try {
        const jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-pfp`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          const errorMessage =
            data.error?.message ||
            data.error ||
            getErrorMessageByStatus(res.status);

          console.error("PFP failed:", {
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

        setPfp(data.data);
      } catch (error) {
        console.error("PFP error: ", error);

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
        setLoading(false);
      }
    }

    GET();
    GETPFP();
  }, [sidebarKey, isRefreshing]);

  return (
    <div className="flex flex-col justify-between h-full pt-0 md:pt-2 transition-colors duration-200">
      <div className="flex flex-col flex-1 min-h-0 mb-2">
        <TopLevel />
        <div className="my-1">
          <div
            onClick={() => router.push("/")}
            className={`flex items-center gap-2 cursor-pointer p-1.5 px-2 rounded-lg transition-all duration-200 ${
              isHomeActive ? "bg-black/4 dark:bg-white/4" : ""
            }`}
          >
            <Home
              className={`transition-colors duration-200 ${
                isHomeActive
                  ? "text-black/60 dark:text-white/60"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
              height={18}
              width={18}
            />
            <p
              className={`pt-0.5 text-sm md:text-sm transition-colors duration-200 ${
                isHomeActive
                  ? "text-black/60 dark:text-white/60"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              Home
            </p>
          </div>
          <div
            onClick={() => router.push("/chats")}
            className={`flex items-center gap-2 mb-2 cursor-pointer p-1.5 px-2 rounded-lg transition-all duration-200 ${
              isChatsActive ? "bg-black/4 dark:bg-white/4" : ""
            }`}
          >
            <MessageCircle
              className={`transition-colors duration-200 ${
                isChatsActive
                  ? "text-black/60 dark:text-white/60"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
              height={18}
              width={18}
            />
            <p
              className={`pt-0.5 text-sm md:text-sm transition-colors duration-200 ${
                isChatsActive
                  ? "text-neutral-700 dark:text-neutral-300"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              Chats
            </p>
          </div>
        </div>

        <div className="bg-neutral-200/80 dark:bg-white/10 w-full h-[1px] my-2 transition-colors duration-200"></div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {loading ? (
            <SideBarLoading />
          ) : (
            <div className="w-full">
              <AnimatedFileTree fileStructure={data} />
            </div>
          )}
        </div>
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
