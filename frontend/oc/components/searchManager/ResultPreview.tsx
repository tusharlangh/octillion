import { DM_Sans } from "next/font/google";
import { HybridSearchResult } from "@/types/search";

const dmSans = DM_Sans({
  weight: ["400", "500"],
  subsets: ["latin"],
});

interface ResultPreviewProps {
  item: HybridSearchResult;
}

export function ResultPreview({ item }: ResultPreviewProps) {
  if (item.text && item.text.length > 0) {
    const preview =
      item.text.length > 280 ? item.text.substring(0, 280) + "…" : item.text;

    return (
      <p
        className={`${dmSans.className} text-[16px] leading-[1.7] font-light
          text-neutral-700 dark:text-neutral-300 
          line-clamp-3`}
      >
        {preview}
      </p>
    );
  }

  if (item.rects && item.rects.length > 0) {
    const keywordText = item.rects.map((rect) => rect.surface).join(" ");
    const preview =
      keywordText.length > 280
        ? keywordText.substring(0, 280) + "…"
        : keywordText;

    return (
      <p
        className={`${dmSans.className} text-[16px] leading-[1.7] font-light
          text-neutral-700 dark:text-neutral-300 
          line-clamp-3`}
      >
        {preview}
      </p>
    );
  }

  return null;
}
