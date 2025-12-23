"use client";

import React, { useState, useEffect } from "react";
import { DM_Sans } from "next/font/google";
import {
  File,
  ChevronRight,
  ChevronDown,
  Activity,
  FileText,
} from "lucide-react";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

interface TermStatsProps {
  termStats: any;
  onPageClick: (fileName: string, pageNo: string, coords: any[]) => void;
}

export default function TermStatsResults({
  termStats,
  onPageClick,
}: TermStatsProps) {
  const [expandedTerms, setExpandedTerms] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>(
    {}
  );

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => ({ ...prev, [term]: !prev[term] }));
  };

  const toggleFile = (fileName: string) => {
    setExpandedFiles((prev) => ({ ...prev, [fileName]: !prev[fileName] }));
  };

  useEffect(() => {
    const terms = Object.keys(termStats);
    if (terms.length === 1 && expandedTerms[terms[0]] === undefined) {
      setExpandedTerms({ [terms[0]]: true });
    }
  }, [termStats]);

  if (!termStats || Object.keys(termStats).length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {Object.entries(termStats).map(([term, data]: [string, any]) => (
        <div
          key={term}
          className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-neutral-200/50 dark:hover:shadow-black/20"
        >
          <div
            onClick={() => toggleTerm(term)}
            className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Activity size={20} />
              </div>
              <div>
                <h3
                  className={`${dmSans.className} text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100`}
                >
                  {term}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Found in {data.global.fileCount}{" "}
                  {data.global.fileCount === 1 ? "file" : "files"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {expandedTerms[term] ? (
                <ChevronDown className="text-neutral-400" />
              ) : (
                <ChevronRight className="text-neutral-400" />
              )}
            </div>
          </div>

          {/* Files List */}
          {expandedTerms[term] && (
            <div className="px-5 pb-5 md:px-6 md:pb-6 space-y-3 border-t border-neutral-100 dark:border-neutral-800 pt-5">
              {Object.entries(data.files).map(
                ([fileName, fileData]: [string, any]) => (
                  <div
                    key={fileName}
                    className="bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleFile(`${term}-${fileName}`)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <File className="text-neutral-400" size={18} />
                        <span
                          className={`${dmSans.className} text-sm md:text-base font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px] md:max-w-md`}
                        >
                          {fileName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-[10px] font-bold text-neutral-600 dark:text-neutral-400">
                          {fileData.total}
                        </span>
                      </div>
                      {expandedFiles[`${term}-${fileName}`] ? (
                        <ChevronDown size={16} className="text-neutral-400" />
                      ) : (
                        <ChevronRight size={16} className="text-neutral-400" />
                      )}
                    </div>

                    {/* Pages List */}
                    {expandedFiles[`${term}-${fileName}`] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-neutral-100 dark:border-neutral-800">
                        {Object.entries(fileData.pages).map(
                          ([pageNo, pageData]: [string, any]) => (
                            <button
                              key={pageNo}
                              onClick={() =>
                                onPageClick(fileName, pageNo, pageData.coords)
                              }
                              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-md transition-all group group-hover:scale-[1.02]"
                            >
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                  <FileText size={14} />
                                </div>
                                <span
                                  className={`${dmSans.className} text-sm font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors`}
                                >
                                  Page {pageNo}
                                </span>
                              </div>
                              <span className="text-xs text-neutral-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {pageData.count} matches
                              </span>
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
