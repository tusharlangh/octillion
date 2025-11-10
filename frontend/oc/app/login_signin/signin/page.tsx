"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import Image from "next/image";
import { signInWithGoogle } from "@/utils/auth/signInWithGoogle";

export default function Signin() {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <main className="h-full w-full bg-[#F5F5F7] dark:bg-[rgb(18,18,18)] flex justify-center items-center p-4">
      <section
        about="central"
        className="flex flex-col justify-center items-center relative bg-white dark:bg-[#0B0B0C] w-full max-w-[600px] rounded-[10px] shadow-sm gap-6 py-12 px-8"
      >
        <div className="w-full flex flex-col items-center gap-6">
          <Logo />

          <h1 className="font-(family-name:--font-dm-sans) font-black text-4xl text-center text-neutral-900 dark:text-[#EAEAEA]">
            Sign in to start crawling documents
          </h1>

          <div
            className="flex justify-center items-center gap-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 rounded-[10px] p-3 px-6 cursor-pointer transition-colors border border-neutral-200 dark:border-neutral-700 w-full"
            onClick={signInWithGoogle}
          >
            <Image
              src={"/google_icon.png"}
              alt="google-icon"
              width={20}
              height={20}
            />
            <p className="font-(family-name:--font-dm-sans) font-bold text-neutral-900 dark:text-[#EAEAEA] text-[16px]">
              Sign in with Google
            </p>
          </div>

          <div className="h-[1px] bg-neutral-200 dark:bg-neutral-700 w-full my-2"></div>

          <div className="flex justify-center items-center gap-2">
            <p
              className={`${font} font-medium text-[14px] text-neutral-600 dark:text-[#8E8E93]`}
            >
              Already have an account?
            </p>
            <Link
              href={"login"}
              className={`${font} font-medium text-[14px] text-blue-600 dark:text-blue-400 hover:underline hover:underline-offset-1 transition-colors`}
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
