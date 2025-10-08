"use client";

import Image from "next/image";
import React, { useRef } from "react";

export default function AddFile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const font: string = "font-(family-name:--font-dm-sans)";

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Selected file 1:", files[0]);
      console.log("Selected file 2:", files[1]);
    }
  };

  return (
    <section className="relative mt-2 shrink-0">
      <div
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.02)" }}
        className="bg-[rgb(46,38,38)] w-[90vw] md:w-[60vw] rounded-[20px] flex flex-col p-3 gap-2"
      >
        <section
          className="flex gap-1 opacity-40 select-none w-full justify-center items-center p-6 border-2 border-dashed border-[rgba(70,92,136,0.4)] rounded-[20px] hover:opacity-60 transition-all cursor-pointer"
          onClick={handleButtonClick}
        >
          <p
            className={`${font} text-[16px] md:text-[18px] text-white font-bold text-shadow-md text-center`}
          >
            Drag or Upload files
          </p>
          <Image
            src={"/icons/upload.svg"}
            alt="upload-icon"
            height={24}
            width={24}
          />
        </section>

        <div className="w-full justify-end flex mt-auto">
          <button
            className={`bg-[#465C88] rounded-[20px] px-4 py-1 cursor-pointer hover:bg-[#5F76A2] transition-colors`}
          >
            <p
              className={`${font} text-[16px] text-white font-bold select-none text-shadow-sm`}
            >
              parse
            </p>
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
        multiple
      />
    </section>
  );
}
