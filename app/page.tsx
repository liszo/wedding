"use client";
import { motion } from "motion/react";
import { slideIn, stagger } from "@/lib/motion";

export default function Home() {
  return (
    <motion.main
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 p-10"
    >
      <motion.h1 variants={slideIn} className="text-4xl font-bold">
        سلام دنیا
      </motion.h1>
      <motion.p variants={slideIn} className="ps-8 text-lg">
        این متن باید از سمت راست شروع شود.
      </motion.p>
    </motion.main>
  );
}