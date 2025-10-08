"use client";

import { useFileUpload } from "../../hooks/useFileUpload";
import FilePreviewList from "./filePreviewList";
import FileUpload from "./fileUpload";

export default function FileManager() {
  const {
    selectedFiles,
    fileInputRef,
    handleButtonClick,
    handleFileChange,
    removeFile,
  } = useFileUpload();

  return (
    <section>
      {selectedFiles.length === 0 ? (
        <FileUpload
          fileInputRef={fileInputRef}
          handleButtonClick={handleButtonClick}
          handleFileChange={handleFileChange}
        />
      ) : (
        <FilePreviewList
          selectedFiles={selectedFiles}
          removeFile={removeFile}
        />
      )}
    </section>
  );
}
