import React from "react";
import FileItem from "./fileItem";

interface FilePreviewListProps {
  selectedFiles: File[];
  removeFile: (i: number) => void;
}

export default function FilePreviewList({
  selectedFiles,
  removeFile,
}: FilePreviewListProps) {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <section className="relative mt-2 shrink-0 cursor-pointer">
      <div
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.02)" }}
        className="bg-[rgb(46,38,38)] w-[90vw] md:w-[60vw] rounded-[20px] flex flex-col p-3 gap-2" //flex justify-center items-center
      >
        <ul className="flex gap-4 md:gap-6 overflow-x-auto h-full pb-2">
          {selectedFiles.map((file, index) => (
            <li key={index}>
              <FileItem
                i={index}
                removeFile={removeFile}
                fileName={file.name}
                fileType={file.type.endsWith("pdf") ? "PDF" : "PDF"}
              />
            </li>
          ))}
        </ul>

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
    </section>
  );
}
