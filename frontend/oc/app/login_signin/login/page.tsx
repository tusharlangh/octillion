"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import Image from "next/image";
import { signInWithGoogle } from "@/utils/auth/signInWithGoogle";

export default function Login() {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <section className="flex justify-center items-center h-screen w-screen">
      <div className="bg-[#1C1C1E] xs: w-[100vw] sm:w-[100vw] md:w-[600px] sm:rounded-0 md:rounded-[20px] py-10 px-4 max-sm:h-screen">
        <div>
          <section className="grid grid-cols-1 gap-[20px]">
            {<Logo dynamicSize={"text-[24px]"} />}

            <section>
              <p className="font-(family-name:--font-dm-sans) font-black text-[#EAEAEA] text-[40px] text-center">
                Log in to Octillion
              </p>
            </section>

            <section className="flex justify-center items-center">
              <div
                className="flex justify-center items-center gap-4 bg-[rgba(255,255,255,0.04)] 
hover:bg-[rgba(255,255,255,0.06)] 
active:bg-[rgba(255,255,255,0.10)] rounded-[20px] p-2 px-6 cursor-pointer transition-colors"
                onClick={signInWithGoogle}
              >
                <Image
                  src={"/google_icon.png"}
                  alt="google-icon"
                  width={20}
                  height={20}
                />
                <p className="font-(family-name:--font-dm-sans) font-bold text-[#EAEAEA] text-[16px]">
                  Continue with Google
                </p>
              </div>
            </section>

            <div className="h-[1px] bg-[rgba(255,255,255,0.06)] mx-4 my-2"></div>

            <section className="flex justify-center items-center mt-2 gap-2">
              <p className={`${font} font-medium text-[14px] text-[#8E8E93]`}>
                Don't have an account?
              </p>
              <Link
                href={"signin"}
                className={`${font} font-medium text-[14px] text-[#8E8E93] hover:underline hover:underline-offset-1 hover:text-white transition-colors`}
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
