import { DM_Sans } from "next/font/google";
import { HybridSearchResult } from "@/types/search";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

interface ResultBadgesProps {
  item: HybridSearchResult;
  totalResults: number;
}

export function ResultBadges({ item, totalResults }: ResultBadgesProps) {
  const normalizedScore = Math.round(item.rrf_score * 1000);

  const position =
    totalResults > 0
      ? Array.from({ length: totalResults }, (_, i) => i).indexOf(
          totalResults - 1 - Math.floor((item.rrf_score / 0.05) * totalResults)
        )
      : 0;

  const isHighRelevancy = position < totalResults * 0.25;

  return (
    <div className="flex items-center gap-2 text-[11px]">
      {item.source === "both" && (
        <span
          className={`${dmSans.className} font-normal
            text-emerald-700 dark:text-emerald-500`}
        >
          hybrid
        </span>
      )}

      {item.source === "semantic" && (
        <span
          className={`${dmSans.className} font-normal
            bg-[rgb(65,125,205)] text-white px-1 rounded-sm`}
        >
          semantic
        </span>
      )}

      {item.source === "keyword" && (
        <span
          className={`${dmSans.className} font-normal
            bg-[rgb(112,157,135)] text-white px-1 rounded-sm`}
        >
          keyword
        </span>
      )}

      {isHighRelevancy && (
        <>
          <span className="opacity-40">·</span>
          <span
            className={`${dmSans.className} font-medium
              text-slate-700 dark:text-slate-400`}
          >
            high relevancy
          </span>
        </>
      )}

      {item.match_count !== undefined && item.match_count > 0 && (
        <>
          <span className="opacity-40">·</span>
          <span
            className={`${dmSans.className} font-normal tabular-nums
              text-neutral-500 dark:text-neutral-500`}
          >
            {item.match_count}
          </span>
        </>
      )}
    </div>
  );
}
