"use client";

import { useContext } from "react";
import { queryContext } from "./searchManger";

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
            className="bg-blue-500/15 text-blue-400 py-[2px] font-medium"
          >
            {s[i]}
          </span>
        );
      } else {
        arr[i] = (
          <span key={keyCounter++} className="text-neutral-200">
            {s[i]}
          </span>
        );
      }
    }

    return arr;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (query.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-900 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p className="text-neutral-500 text-lg font-light">
            No results found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="pt-24 px-6 max-w-5xl mx-auto">
        <div className="flex items-end justify-between">
          <div className="">
            <h1 className="text-[20px] font-medium text-white tracking-tight">
              Top Results
            </h1>
            <p className="text-neutral-500 text-[16px] font-light">
              Found {query.length} {query.length === 1 ? "result" : "results"}{" "}
              for "{lastSuccessfulSearch}"
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 max-w-5xl mx-auto pt-4 pb-16">
        <div className="space-y-4">
          {query.map((result, i) => (
            <div
              key={i}
              className="group bg-neutral-950/50 backdrop-blur-xl border border-[#1C1C1E] 
                       rounded-[20px] p-8 
                       hover:bg-[#1C1C1E] 
                       transition-all duration-300 cursor-pointer"
            >
              <p className="text-[18px] leading-[1.6] font-light tracking-[-0.01em]">
                {renderSentence(result.sentence)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-32" />
    </div>
  );
}
