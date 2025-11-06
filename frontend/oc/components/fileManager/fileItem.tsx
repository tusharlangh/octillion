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
    <section className="bg-[#F9F9FB] dark:bg-[rgb(31,31,31)] w-[242px] h-[62px] rounded-[20px] flex items-center gap-[10px] p-[12px] shadow-sm relative ">
      <div className="bg-black dark:bg-white rounded-[4px] px-3 py-3 ">
        <Image
          src={"/icons/draft.svg"}
          alt="draft-icon"
          height={20}
          width={20}
          className="block dark:hidden"
        />
        <Image
          src={"/icons/draft_light.svg"}
          alt="draft-icon"
          height={20}
          width={20}
          className="hidden dark:block"
        />
      </div>
      <div>
        <p
          className={`${font} font-bold text-[16px] truncate w-[120px] text-black dark:text-white`}
        >
          {fileName}
        </p>
        <p
          className={`${font} font-bold text-[12px] opacity-50 text-black dark:text-white`}
        >
          {fileType}
        </p>
      </div>
      <div
        className="bg-transparent hover:bg-[rgba(0, 0, 0, 0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(0, 0, 0, 0.12)] dark:active:bg-[rgba(255,255,255,0.12)] absolute top-2 right-2 cursor-pointer rounded-full w-[24px] h-[24px] flex items-center justify-center"
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
          className="hidden dark:block"
        />
        <Image
          src={"/icons/close_light.svg"}
          alt="close-icon"
          height={20}
          width={20}
          className="block dark:hidden"
        />
      </div>
    </section>
  );
}
