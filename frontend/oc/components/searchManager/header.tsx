"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Props {
  id: string;
}

export default function Header({ id }: Props) {
  const font: string = "font-(family-name:--font-dm-sans)";
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function get() {
      try {
        const query = new URLSearchParams({ id: id, search: search });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/parse-files/?${query}`,
          {
            method: "GET",
            headers: { method: "application/json" },
          }
        );

        console.log(res);
      } catch (error) {
        console.error(error);
      }
    }
    //get();
  }, [search]);

  return (
    <div>
      <section className="absolute top-2 left-2 right-2 flex justify-between items-center">
        <section className="flex gap-2 w-full p-2">
          <div className="rounded-full h-[50px] w-[50px] bg-[rgba(41, 31, 29, 1)] flex justify-center items-center border-1 border-[rgb(46,38,37)] hover:bg-[#463A3A] hover:border-[#504343] transition-all cursor-pointer">
            <Image
              src={"/icons/menu.svg"}
              alt="menu-icon"
              height={24}
              width={24}
            />
          </div>
          <div className="rounded-full h-[50px] w-[50px] bg-[rgb(46,38,37)] flex justify-center items-center border-1 border-[rgb(46,38,37)] hover:bg-[#463A3A] hover:border-[#504343] transition-all cursor-pointer">
            <Image
              src={"/icons/home.svg"}
              alt="home-icon"
              height={24}
              width={24}
            />
          </div>

          <section className="relative w-1/2 md:w-lg shadow-xs md:ml-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Image
                src="/icons/search.svg"
                alt="search-icon"
                height={26}
                width={26}
              />
            </div>

            <input
              placeholder="Search documents"
              className={`${font} text-[16px] h-[50px] text-white placeholder-white font-normal bg-[rgb(46,38,37)] rounded-full pl-12 px-1 border-1 border-[rgb(46,38,37)] outline-none w-full hover:bg-[#463A3A] hover:border-[#504343] transition-all focus:border-white`}
              type="text"
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>
          <div className="rounded-full bg-[rgb(46,38,37)] h-[50px] w-[50px] cursor-pointer flex justify-center items-center hover:bg-[#463A3A] hover:border-[#504343] border-1 border-[rgb(46,38,37)] hover:border-[#504343] transition-all">
            <Image
              src="/icons/folder.svg"
              alt="search-icon"
              height={26}
              width={26}
              className=""
            />
          </div>
        </section>
      </section>
    </div>
  );
}
