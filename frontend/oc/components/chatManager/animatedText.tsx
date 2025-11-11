"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export default function AnimatedText({
  text,
  className = "",
}: AnimatedTextProps) {
  const [sentences, setSentences] = useState<string[]>([]);

  useEffect(() => {
    let parts: string[] = [];

    if (text.includes(".") || text.includes("!") || text.includes("?")) {
      parts = text
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => s.trim());
    } else {
      parts = text.split(/\n+/).filter((s) => s.trim().length > 0);
      if (parts.length === 0) {
        parts = [text];
      }
    }

    setSentences(parts);
  }, [text]);

  if (sentences.length === 0) {
    return <div className={className} />;
  }

  return (
    <div className={className}>
      {sentences.map((sentence, index) => {
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: index * 0.05,
              ease: "easeOut",
            }}
          >
            {sentence}
          </motion.span>
        );
      })}
    </div>
  );
}
