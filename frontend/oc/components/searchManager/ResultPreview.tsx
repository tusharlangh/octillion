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
      item.text.length > 150 ? item.text.substring(0, 150) + "..." : item.text;

    return (
      <p
        className={`${dmSans.className} text-sm text-neutral-600 
          dark:text-neutral-400 mt-2 line-clamp-2`}
      >
        {preview}
      </p>
    );
  }

  return null;
}
