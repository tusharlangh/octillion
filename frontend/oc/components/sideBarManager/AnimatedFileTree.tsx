"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import FileOpener from "../fileManager/fileOpener";
import { useRouter } from "next/navigation";

const font: string = "font-(family-name:--font-dm-sans)";

interface FileNode {
  id: number;
  user_id: string;
  created_at: string;
  parse_id: string;
  files: any[];
  type: "folder" | "file";
  name: string;
  presignedUrl?: string;
  status: "PROCESSING" | "PROCESSED";
}

interface FileTreeProps {
  fileStructure: FileNode[];
}

const truncateMiddle = (folderName: string) => {
  return folderName.length > 26
    ? folderName.slice(0, 10) +
        "..." +
        folderName.slice(folderName.length - 14, folderName.length)
    : folderName;
};

export default function AnimatedFileTree({ fileStructure }: FileTreeProps) {
  if (!fileStructure || fileStructure.length === 0) {
    return (
      <div
        className={`${font} flex flex-col text-black/50 dark:text-white/50 items-center justify-center py-8`}
      >
        <p className="text-3xl">(·.·)</p>
        <p
          className={`${font} text-sm text-black/50 dark:text-white/50 px-4 py-2`}
        >
          No files or folders found
        </p>
      </div>
    );
  }

  return (
    <div className={`${font} font-mono text-md text-white rounded-xl`}>
      {fileStructure.map((node, index) => (
        <TreeNode key={index} node={node} />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: FileNode;
}

function TreeNode({ node }: TreeNodeProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.type === "folder" && node.files?.length;
  const [openFile, setOpenFile] = useState(false);
  const status = node.status === "PROCESSED";

  const router = useRouter();

  return (
    <div className="select-none">
      <motion.div
        className={`w-full flex items-center justify-between py-1 cursor-pointer rounded-lg px-2 hover:bg-black/2 dark:hover:bg-white/8 transition-colors text-black/50 dark:text-white/70 text-black dark:hover:text-white group`}
        whileHover={{ x: node.type === "folder" ? (status ? 3 : 0) : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => {
          if (status && hasChildren && !e.defaultPrevented) {
            router.push(`/search/${node.parse_id}`);
          } else if (node.type === "file" && node.presignedUrl) {
            setOpenFile(true);
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {status && hasChildren ? (
            <motion.div
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(!open);
              }}
              className="flex items-center justify-center w-[14px]"
            >
              <ChevronRight
                size={14}
                className={`dark:text-white/70 group-hover:text-black dark:group-hover:text-white ${
                  open ? "text-black" : ""
                }`}
              />
            </motion.div>
          ) : (
            <div className="w-[14px]" />
          )}
          <span
            className={`${font} group-hover:text-black dark:group-hover:text-white transition-colors text-[14px] ${
              open ? "text-black dark:text-white" : ""
            }`}
          >
            {truncateMiddle(node.name)}
          </span>
        </div>

        {!status && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <LoaderCircle className="" height={16} width={16} />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence initial={false}>
        {status && open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pl-6 border-l border-white/20"
          >
            {node.files.map((child: FileNode, i: number) => (
              <TreeNode key={i} node={child} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {status && node.type === "file" && node.presignedUrl && (
        <FileOpener
          isOpen={openFile}
          setIsOpen={setOpenFile}
          url={node.presignedUrl}
          fileName={node.name}
        />
      )}
    </div>
  );
}
