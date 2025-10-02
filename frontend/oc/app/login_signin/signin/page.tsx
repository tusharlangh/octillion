import Image from "next/image";
import Link from "next/link";

export default function Signin() {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <section className="flex justify-center items-center h-screen w-screen">
      <div className="bg-[#1E1515] xs:w-[100vw] sm:w-[100vw] md:w-[600px] rounded-[20px] py-10 px-4 max-sm:h-screen">
        <div>
          <section className="grid grid-cols-1  gap-[20px]">
            <div className="font-(family-name:--font-do_hyeon) text-[30px] flex justify-center items-center w-full">
              <p
                style={{ textShadow: "0 0 60px rgba(255, 122, 48, 0.6)" }}
                className="bg-gradient-to-r from-[#FF7A30] to-[#465C88] bg-clip-text text-transparent"
              >
                Octillion
              </p>
            </div>

            <section>
              <p className="font-(family-name:--font-dm-sans) font-black text-white text-[40px] text-center ">
                Sign in to start crawling documents
              </p>
            </section>

            <section className="flex justify-center items-center">
              <div className="flex justify-center items-center gap-4 outline-[#464646] outline-1 rounded-[20px] p-2 px-6 cursor-pointer hover:outline-white transition-colors">
                <Image
                  src={"/google_icon.png"}
                  alt="google-icon"
                  width={20}
                  height={20}
                />
                <p className="font-(family-name:--font-dm-sans) font-bold text-white text-[16px]">
                  Sign in with Google
                </p>
              </div>
            </section>

            <div className="h-[1px] bg-[#3C3131] mx-4 my-2"></div>

            <section className="flex justify-center items-center mt-2 gap-2">
              <p className={`${font} font-bold text-[14px]`}>
                Already have an account?
              </p>
              <Link
                href={"login"}
                className={`${font} font-bold text-[14px] underline underline-offset-1 hover:text-[#FF7A30] transition-colors`}
              >
                Login
              </Link>
            </section>
          </section>
        </div>
      </div>
    </section>
  );
}
