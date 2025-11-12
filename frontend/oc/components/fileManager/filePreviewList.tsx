"use client";

import React, { useState } from "react";
import FileItem from "./fileItem";
import FileOpener from "./fileOpener";
import { useRouter } from "next/navigation";
import FileUploadLoading from "./fileUploadLoading";
import { handleTokenAction } from "@/utils/supabase/handleTokenAction";
import ErrorPopUp from "../popUp/errorPopUp";

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

  const [error, setError] = useState<string | null>(null);

  const openPDF = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    setIsOpen(true);
  };

  const sendPdf = async () => {
    setError(null);

    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    if (selectedFiles.length > 10) {
      setError("Too many files uploaded. Maximum 10 files allowed.");
      return;
    }

    const formData = new FormData();
    const id = crypto.randomUUID();

    try {
      setLoading(true);

      let jwt: string | undefined;
      try {
        jwt = await handleTokenAction();
        if (!jwt) {
          throw new Error("Failed to get authentication token");
        }
      } catch (tokenError) {
        console.error("Token error:", tokenError);
        setError("Authentication failed. Please try logging in again.");
        setLoading(false);
        return;
      }

      formData.append("id", id);
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-files`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) {
        let errorMessage = "Failed to upload files. Please try again.";

        try {
          const errorData = await res.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error) {
            errorMessage =
              typeof errorData.error === "string"
                ? errorData.error
                : errorMessage;
          }
        } catch (parseError) {
          if (res.status === 401 || res.status === 403) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (res.status === 400) {
            errorMessage = "Invalid request. Please check your files.";
          } else if (res.status === 413) {
            errorMessage = "File size too large. Please upload smaller files.";
          } else if (res.status >= 500) {
            errorMessage =
              "Server error. Please try again later or contact support.";
          }
        }

        console.error("Upload failed:", {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
        });

        setError(errorMessage);
        setLoading(false);
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setError("Received invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        const errorMessage =
          data.error?.message ||
          data.error ||
          "Failed to upload files. Please try again.";

        console.error("API error:", {
          code: data.error?.code,
          message: errorMessage,
          details: data.error?.details,
        });

        setError(errorMessage);
        setLoading(false);
        return;
      }

      router.push(`/search/${id}`);
    } catch (error) {
      console.error("Unexpected error during file upload:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <section className="relative mt-2 shrink-0 cursor-pointer">
      <div
        className="bg-white dark:bg-[rgb(18,18,18)] w-[90vw] md:w-[50vw] rounded-[20px] 
                   flex flex-col p-3 gap-2 
                   
                   border border-neutral-200/80 dark:border-neutral-800/80
                   transition-all duration-200"
      >
        <ul
          className="flex gap-4 md:gap-6 overflow-x-auto h-full pb-2
                      scrollbar-thin scrollbar-track-transparent
                      scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
                      dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
                      transition-colors duration-200"
        >
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
            className={`bg-neutral-900 dark:bg-white 
                       hover:bg-neutral-800 dark:hover:bg-neutral-100
                       active:bg-neutral-700 dark:active:bg-neutral-200
                       rounded-[20px] px-4 py-1.5
                       transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => sendPdf()}
            disabled={loading}
          >
            <p
              className={`${font} text-[16px] text-white dark:text-neutral-900 
                         font-medium select-none tracking-wide`}
            >
              parse
            </p>
          </button>
        </div>
      </div>
      <FileUploadLoading isOpen={loading} />
      {error && (
        <ErrorPopUp
          errorMessage={error}
          onDismiss={() => setError(null)}
          isHome={true}
        />
      )}
    </section>
  );
}
