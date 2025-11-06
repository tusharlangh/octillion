"use client";

import Image from "next/image";
import React from "react";
import { Upload, SendHorizonal } from "lucide-react";

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
        className="bg-white dark:bg-[rgb(18,18,18)] w-[90vw] md:w-[50vw] rounded-[20px] flex flex-col p-3 gap-2 
                   border border-neutral-200/80 dark:border-neutral-800/80
                   transition-all duration-200"
      >
        <section
          className="flex gap-2 select-none w-full justify-center items-center p-6 
                     border-2 border-dashed 
                     border-neutral-300/50 dark:border-neutral-600/50 
                     hover:border-neutral-400 dark:hover:border-neutral-600
                     rounded-[20px] 
                     group
                     transition-all duration-200 cursor-pointer"
          onClick={handleButtonClick}
        >
          <p
            className={`${font} text-[16px] md:text-[18px] 
                       text-neutral-500 dark:text-neutral-400
                       group-hover:text-neutral-700 dark:group-hover:text-neutral-200 
                       font-bold text-center transition-colors duration-200`}
          >
            Drag or Upload files
          </p>
          <Upload
            height={20}
            width={20}
            className="text-neutral-500 dark:text-neutral-400
                       group-hover:text-neutral-700 dark:group-hover:text-neutral-200
                       transition-colors duration-200"
          />
        </section>

        <div className="w-full justify-end flex mt-auto">
          <button
            className={`bg-neutral-200 dark:bg-neutral-700/50 
                       hover:bg-neutral-300 dark:hover:bg-neutral-700
                       rounded-[20px] px-4 py-1.5
                       transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled
          >
            <p
              className={`${font} text-[16px] 
                         text-neutral-500 dark:text-neutral-400 
                         font-medium`}
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
