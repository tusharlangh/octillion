"use client";

import { motion } from "framer-motion";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function SearchLoading() {
  return (
    <div className="pt-2 px-13 overflow-y-hidden">
      <div className="pt-5 pb-16">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              className="group backdrop-blur-xl border border-[#E5E5E5] dark:border-[#1C1C1E] 
                       rounded-[20px] p-8"
            >
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <motion.div
                    key={j}
                    className={`${dmSans.className} h-[29px] bg-black/10 dark:bg-white/10 rounded`}
                    style={{ width: `${Math.random() * 30 + 70}%` }}
                    animate={{
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: j * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
