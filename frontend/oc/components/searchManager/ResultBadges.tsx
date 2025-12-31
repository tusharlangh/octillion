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
    <div className="flex items-center gap-2 flex-wrap">
      {item.source === "both" && (
        <span
          className={`${dmSans.className} bg-emerald-100 dark:bg-emerald-900/30 
            px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400 
            text-xs font-medium border border-emerald-200 dark:border-emerald-800`}
        >
          Both methods
        </span>
      )}

      {item.source === "semantic" && (
        <span
          className={`${dmSans.className} bg-blue-100 dark:bg-blue-900/30 
            px-2 py-0.5 rounded text-blue-700 dark:text-blue-400 
            text-xs font-medium border border-blue-200 dark:border-blue-800`}
        >
          Semantic
        </span>
      )}

      {item.source === "keyword" && (
        <span
          className={`${dmSans.className} bg-purple-100 dark:bg-purple-900/30 
            px-2 py-0.5 rounded text-purple-700 dark:text-purple-400 
            text-xs font-medium border border-purple-200 dark:border-purple-800`}
        >
          Keyword
        </span>
      )}

      {isHighRelevancy && (
        <span
          className={`${dmSans.className} bg-[rgb(59,117,198)] 
            px-2 py-0.5 rounded text-white text-xs font-medium`}
        >
          High relevancy
        </span>
      )}

      {item.match_count !== undefined && item.match_count > 0 && (
        <span
          className={`${dmSans.className} bg-neutral-100 dark:bg-neutral-800 
            px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-400 
            text-xs font-medium`}
        >
          {item.match_count} {item.match_count === 1 ? "match" : "matches"}
        </span>
      )}

      <span
        className={`${dmSans.className} bg-neutral-50 dark:bg-neutral-900 
          px-2 py-0.5 rounded text-neutral-500 dark:text-neutral-500 
          text-xs font-mono`}
        title={`RRF Score: ${item.rrf_score.toFixed(4)}`}
      >
        {normalizedScore}
      </span>
    </div>
  );
}
