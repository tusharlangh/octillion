import Image from "next/image";
interface FileViewProps {
  i: number;
  fileName: string;
  fileType: string;
  removeFile: (i: number) => void;
}

export default function FileItem({
  i,
  fileName,
  fileType,
  removeFile,
}: FileViewProps) {
  const font: string = "font-(family-name:--font-dm-sans)";

  return (
    <section className="bg-[#2C2C2E] w-[242px] h-[62px] rounded-[20px] flex items-center gap-[10px] p-[12px] shadow-sm relative ">
      <div className="bg-[#EB5858] rounded-[4px] px-3 py-3 ">
        <Image
          src={"/icons/draft.svg"}
          alt="draft-icon"
          height={20}
          width={20}
        />
      </div>
      <div>
        <p
          className={`${font} font-bold text-[16px] truncate w-[120px] text-white`}
        >
          {fileName}
        </p>
        <p className={`${font} font-bold text-[12px] opacity-50 text-white`}>
          {fileType}
        </p>
      </div>
      <div
        className="bg-transparent hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.12)] absolute top-2 right-2 cursor-pointer rounded-full w-[24px] h-[24px] flex items-center justify-center"
        onClick={(e) => {
          e.stopPropagation();
          removeFile(i);
        }}
      >
        <Image
          src={"/icons/close.svg"}
          alt="close-icon"
          height={20}
          width={20}
        />
      </div>
    </section>
  );
}
