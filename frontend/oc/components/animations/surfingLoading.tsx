"use client";

import { motion } from "framer-motion";

export default function SurfingLoading() {
  return (
    <div className="flex items-center py-2">
      <motion.span
        className="inline-block w-4 h-4 bg-black/80 dark:bg-white/80 ml-1 rounded-full"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
