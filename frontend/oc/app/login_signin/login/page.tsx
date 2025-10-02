import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const font: string = "font-(family-name:--font-dm-sans)";
  return (
    <section className="flex justify-center items-center h-screen w-screen">
      <div className="bg-[#1E1515] xs: w-[100vw] sm:w-[100vw] md:w-[600px] rounded-[20px] py-10 px-4 max-sm:h-screen">
        <div>
          <section className="grid grid-cols-1 gap-[20px]">
            <div className="font-(family-name:--font-do_hyeon) text-[30px] flex justify-center items-center w-full">
              <p
                style={{ textShadow: "0 0 60px rgba(255, 122, 48, 0.6)" }}
                className="bg-gradient-to-r from-[#FF7A30] to-[#465C88] bg-clip-text text-transparent"
              >
                Octillion
              </p>
            </div>

            <section>
              <p className="font-(family-name:--font-dm-sans) font-black text-white text-[40px] text-center">
                Log in to Octillion
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
                  Continue with Google
                </p>
              </div>
            </section>

            <div className="h-[1px] bg-[#3C3131] mx-4 my-2"></div>

            <section className="flex justify-center items-center">
              <section className="">
                <div className="">
                  <p className={`${font} font-bold pl-1`}>Email address</p>
                  <input
                    type="email"
                    placeholder="Email address"
                    className={`w-[380px] h-[47px] rounded-[10px] bg-[rgb(44,37,36)] ${font} font-bold pl-3 mt-1 hover:outline transition-colors`}
                  />
                </div>

                <div className="mt-4">
                  <p className={`${font} font-bold pl-1`}>Password</p>
                  <input
                    type="password"
                    placeholder="Password"
                    className={`w-[380px] h-[47px] rounded-[10px] bg-[rgb(44,37,36)] ${font} font-bold pl-3 mt-1 hover:outline transition-colors`}
                  />
                </div>
              </section>
            </section>

            <section className="flex justify-center items-center mt-2">
              <button
                className={`bg-[#465C88] hover:bg-[#5976B0] transition-colors rounded-[10px] px-30 py-2 cursor-pointer shadow-[#465C88]-md`}
              >
                <p className={`${font} font-bold text-[20px]`}>Login</p>
              </button>
            </section>

            <section className="flex justify-center items-center mt-2 gap-2">
              <p className={`${font} font-bold text-[14px]`}>
                Don't have an account?
              </p>
              <Link
                href={"signin"}
                className={`${font} font-bold text-[14px] underline underline-offset-1 hover:text-[#FF7A30] transition-colors`}
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
