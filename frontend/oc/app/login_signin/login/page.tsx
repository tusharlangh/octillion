"use client";

import { verifyAuth } from "@/components/auth/verifyAuth";
import GoogleAuth from "@/components/auth/googleAuth";
import Link from "next/link";
import Logo from "@/components/logo";

export default function Login() {
  const font: string = "font-(family-name:--font-dm-sans)";
  verifyAuth();

  return (
    <section className="flex justify-center items-center h-screen w-screen">
      <div className="bg-[#1E1515] xs: w-[100vw] sm:w-[100vw] md:w-[600px] sm:rounded-0 md:rounded-[20px] py-10 px-4 max-sm:h-screen">
        <div>
          <section className="grid grid-cols-1 gap-[20px]">
            {<Logo dynamicSize={"text-[24px]"} />}

            <section>
              <p className="font-(family-name:--font-dm-sans) font-black text-white text-[40px] text-center">
                Log in to Octillion
              </p>
            </section>

            {<GoogleAuth title="Continue with Google" />}

            <div className="h-[1px] bg-[#3C3131] mx-4 my-2"></div>

            <section className="flex justify-center items-center mt-2 gap-2">
              <p className={`${font} font-bold text-[14px] text-white`}>
                Don't have an account?
              </p>
              <Link
                href={"signin"}
                className={`${font} font-bold text-[14px] text-white underline underline-offset-1 hover:text-[#FF7A30] transition-colors`}
              >
                Sign up for Octillion
              </Link>
            </section>
          </section>
        </div>
      </div>
    </section>
  );
}
