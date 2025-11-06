"use client";

import { useContext } from "react";
import { queryContext } from "./searchManger";
import { DM_Sans } from "next/font/google";
import SearchLoading from "../animations/searchLoading";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Result() {
  const context = useContext(queryContext);

  if (!context) throw new Error("queryContext is not working");

  const { isLoading, query, lastSuccessfulSearch } = context;

  function renderSentence(sentence: string) {
    const s: string = sentence;
    const search: string = lastSuccessfulSearch.toLowerCase();
    let keyCounter = 0;
    let seen: number[][] = [];
    for (let word of search.split(" ")) {
      let pos = 0;
      while ((pos = s.toLowerCase().indexOf(word, pos)) !== -1) {
        seen.push([pos, pos + word.length - 1]);
        pos += 1;
      }
    }
    seen.sort((a, b) => a[0] - b[0]);

    const arr: any[] = new Array(s.length).fill(null);
    let range_i = 0;

    for (let i = 0; i < s.length; i++) {
      if (range_i < seen.length - 1 && i > seen[range_i][1]) {
        range_i++;
      }

      if (
        range_i < seen.length &&
        i >= seen[range_i][0] &&
        i <= seen[range_i][1]
      ) {
        arr[i] = (
          <span
            key={keyCounter++}
            className="bg-amber-100 text-amber-900 
                     dark:bg-blue-400/10 dark:text-blue-300 
                     py-[2px] font-medium transition-colors duration-200"
          >
            {s[i]}
          </span>
        );
      } else {
        arr[i] = (
          <span
            key={keyCounter++}
            className="text-neutral-800 dark:text-neutral-200 transition-colors duration-200"
          >
            {s[i]}
          </span>
        );
      }
    }

    return arr;
  }

  if (lastSuccessfulSearch.trim() === "" && query.length === 0) {
    return (
      <div className="">
        <div className="pt-2 px-13 flex flex-col items-center justify-center gap-5 h-[60vh]">
          <p
            className={`${dmSans.className} text-8xl font-medium 
                       text-neutral-800 dark:text-neutral-200
                       transition-colors duration-200`}
          >
            (◠‿◠)
          </p>
          <p
            className={`${dmSans.className} text-2xl font-medium 
                       text-neutral-800 dark:text-neutral-200
                       transition-colors duration-200`}
          >
            Start your search!
          </p>
        </div>
      </div>
    );
  }

  if (lastSuccessfulSearch.trim() !== "" && query.length === 0) {
    return (
      <div className="">
        <div className="pt-2 px-13 flex flex-col items-center justify-center gap-5 h-[60vh]">
          <p
            className={`${dmSans.className} text-8xl font-medium 
                       text-neutral-800 dark:text-neutral-200
                       transition-colors duration-200`}
          >
            (^_^)
          </p>
          <p
            className={`${dmSans.className} text-2xl font-medium 
                       text-neutral-800 dark:text-neutral-200
                       transition-colors duration-200`}
          >
            No results found for "{lastSuccessfulSearch}"
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <SearchLoading />;
  }

  return (
    <div className="pt-2 px-13">
      <div className="pb-2">
        <div className="flex items-end justify-between">
          {query.length !== 0 && (
            <p
              className={`${dmSans.className} text-neutral-500 dark:text-neutral-400
                          transition-colors duration-200`}
            >
              {query.length} items
            </p>
          )}
        </div>
      </div>

      <div className="pt-5 pb-16">
        <div className="space-y-4">
          {query.map((result, i) => (
            <div
              key={i}
              className="group backdrop-blur-xl 
                       border border-neutral-200 dark:border-neutral-800
                       bg-white/50 dark:bg-neutral-900/50
                       rounded-[20px] p-8 
                       hover:bg-neutral-100 dark:hover:bg-neutral-800/50
                       transition-all duration-300 cursor-pointer"
            >
              <p
                className={`${dmSans.className} text-[18px] leading-[1.6] 
                           font-light tracking-[-0.01em]
                           text-neutral-800 dark:text-neutral-200
                           transition-colors duration-200`}
              >
                {renderSentence(result.sentence)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
