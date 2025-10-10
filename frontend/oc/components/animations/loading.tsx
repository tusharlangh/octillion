"use client";

import { motion, Variants } from "framer-motion";

function LoadingThreeDotsPulse() {
  const dotVariants: Variants = {
    pulse: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      animate="pulse"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex justify-center items-center gap-[20px]"
    >
      <motion.div
        className="w-[20px] h-[20px] rounded-full bg-white"
        variants={dotVariants}
      />
      <motion.div
        className="dow-[20px] h-[20px] rounded-full bg-white"
        variants={dotVariants}
      />
      <motion.div
        className="w-[20px] h-[20px] rounded-full bg-white"
        variants={dotVariants}
      />
    </motion.div>
  );
}

export default LoadingThreeDotsPulse;
