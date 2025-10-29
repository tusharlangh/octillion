"use client";

import { useContext } from "react";
import { queryContext } from "./searchManger";

export default function Result() {
  const context = useContext(queryContext);

  if (!context) throw new Error("queryContext is not working");

  const { isLoading, query, search } = context;

  const renderSentence = (sentence: string) => {
    //the only problem right now is if the user searches "door," any text with "door." will be highlighted
    const searchNormalized = search
      .toLowerCase()
      .replace(/[.,!?;:'"()[\]{}]+/g, "");

    const regexPattern = searchNormalized
      .split("")
      .map((char) => `${char}[.,!?;:'"()\\[\\]{}]*`)
      .join("");

    const regex = new RegExp(`(${regexPattern})`, "gi");
    const parts = sentence.split(regex);

    return parts.filter(Boolean).map((part, idx) => {
      const normalized = part.toLowerCase().replace(/[.,!?;:'"()[\]{}]+/g, "");
      const isMatch = normalized.startsWith(searchNormalized);

      return (
        <span
          key={idx}
          className={
            isMatch
              ? "bg-blue-500/15 text-blue-400 py-[2px] rounded-md font-medium"
              : "text-neutral-200"
          }
        >
          {part}
        </span>
      );
    });
  };

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
              for "{search}"
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
