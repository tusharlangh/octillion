"use client";

import React, { useRef, useState } from "react";

export function useFileUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const removeFile = (i: number): void => {
    const files: File[] = selectedFiles.filter((file, index) => i !== index);
    setSelectedFiles(files);
    console.log(i);
  };

  return {
    selectedFiles,
    fileInputRef,
    handleButtonClick,
    handleFileChange,
    removeFile,
  };
}
