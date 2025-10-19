"use client";

import React, { useState } from "react";
import FileItem from "./fileItem";
import FileOpener from "./fileOpener";
import { useRouter } from "next/navigation";
import FileUploadLoading from "./fileUploadLoading";

interface FilePreviewListProps {
  selectedFiles: File[];
  removeFile: (i: number) => void;
}

export default function FilePreviewList({
  selectedFiles,
  removeFile,
}: FilePreviewListProps) {
  if (selectedFiles.length === 0) {
    return <FileUploadLoading isOpen={true} />;
  }

  const font: string = "font-(family-name:--font-dm-sans)";
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const openPDF = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    setIsOpen(true);
  };

  const sendPdf = async () => {
    const formData = new FormData();
    const id = crypto.randomUUID();
    formData.append("id", id);

    selectedFiles.forEach((file, i) => formData.append("files", file));

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-files`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setTimeout(() => router.push(`/search/${id}`), 5000);
      }
    } catch (error) {
      console.log("error occured during sending");
    }
  };

  return (
    <section className="relative mt-2 shrink-0 cursor-pointer">
      <div
        style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.02)" }}
        className="bg-[rgb(46,38,38)] w-[90vw] md:w-[50vw] rounded-[20px] flex flex-col p-3 gap-2" //flex justify-center items-center
      >
        <ul className="flex gap-4 md:gap-6 overflow-x-auto h-full pb-2">
          {selectedFiles.map((file, index) => (
            <li key={index} onClick={() => openPDF(file)}>
              <FileItem
                i={index}
                removeFile={removeFile}
                fileName={file.name}
                fileType={file.type.endsWith("pdf") ? "PDF" : "PDF"}
              />
            </li>
          ))}
        </ul>

        <FileOpener
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          url={previewUrl}
          fileName={fileName}
        />

        <div className="w-full justify-end flex mt-auto">
          <button
            className={`bg-[#465C88] rounded-[20px] px-4 py-1 cursor-pointer hover:bg-[#5F76A2] transition-colors`}
            onClick={sendPdf}
          >
            <p
              className={`${font} text-[16px] text-white font-bold select-none text-shadow-sm`}
            >
              parse
            </p>
          </button>
        </div>
      </div>
      <FileUploadLoading isOpen={loading} />
    </section>
  );
}
