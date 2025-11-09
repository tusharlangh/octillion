"use client";

import { motion } from "framer-motion";

export function SideBarLoading() {
  // Deterministic values to prevent hydration errors
  const mainWidths = [75, 82, 68, 85, 70]; // % widths for main items
  const nestedCounts = [2, 1, 3, 2, 1]; // Number of nested items
  const nestedWidths = [
    [55, 48], // for item 0
    [52], // for item 1
    [45, 58, 50], // for item 2
    [53, 47], // for item 3
    [51], // for item 4
  ];

  return (
    <div className="w-full h-full">
      <div className="space-y-3 px-3 py-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: "easeOut",
            }}
            className="relative"
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 rounded bg-neutral-200/80 dark:bg-white/10 transition-colors duration-200"
                animate={{
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-4 rounded bg-neutral-200/80 dark:bg-white/10 transition-colors duration-200"
                style={{ width: `${mainWidths[i]}%` }}
                animate={{
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            </div>

            {/* Nested items with increasing indentation */}
            {i % 2 === 0 && (
              <div className="ml-6 mt-2 space-y-2 border-l border-neutral-200/50 dark:border-white/10 transition-colors duration-200 pl-2">
                {[...Array(nestedCounts[i])].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: (i + j) * 0.15,
                      ease: "easeOut",
                    }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      className="w-3 h-3 rounded bg-neutral-200/60 dark:bg-white/8 transition-colors duration-200"
                      animate={{
                        opacity: [0.3, 0.15, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: j * 0.1,
                      }}
                    />
                    <motion.div
                      className="h-3 rounded bg-neutral-200/60 dark:bg-white/8 transition-colors duration-200"
                      style={{ width: `${nestedWidths[i][j]}%` }}
                      animate={{
                        opacity: [0.3, 0.15, 0.3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: j * 0.1,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
