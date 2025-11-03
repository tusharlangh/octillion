"use client";

import Image from "next/image";
import React from "react";

interface FileUploadProps {
  handleButtonClick: React.MouseEventHandler<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: React.ChangeEventHandler<HTMLInputElement>;
}

export default function FileUpload({
  handleButtonClick,
  fileInputRef,
  handleFileChange,
}: FileUploadProps) {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <section className="relative mt-2 shrink-0">
      <div
        //style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.02)" }}
        className="bg-[#FFFFFF] dark:bg-[#1C1C1E] w-[90vw] md:w-[50vw] rounded-[20px] flex flex-col p-3 gap-2"
      >
        <section
          className="flex gap-1 opacity-40 select-none w-full justify-center items-center p-6 border-2 border-dashed border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.4)] rounded-[20px] hover:opacity-60 transition-all cursor-pointer"
          onClick={handleButtonClick}
        >
          <p
            className={`${font} text-[16px] md:text-[18px] text-black dark:text-white font-bold text-shadow-sm text-center`}
          >
            Drag or Upload files
          </p>
          <Image
            src="/icons/upload_light.svg"
            alt=""
            height={20}
            width={20}
            className="block dark:hidden"
          />
          <Image
            src="/icons/upload.svg"
            alt=""
            height={20}
            width={20}
            className="hidden dark:block"
          />
        </section>

        <div className="w-full justify-end flex mt-auto">
          <button
            className={`bg-[#C7C7CC] dark:bg-[#8E8E93] rounded-[20px] px-4 py-1 transition-colors cursor-not-allowed`}
            disabled
          >
            <p
              className={`${font} text-[16px] text-[#6B6B6B] dark:text-black font-bold `}
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
