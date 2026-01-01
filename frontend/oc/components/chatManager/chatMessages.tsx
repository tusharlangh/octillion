"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { chatContext } from "./charManger";
import { DM_Sans } from "next/font/google";
import { Copy, Check } from "lucide-react";
import { Libre_Baskerville } from "next/font/google";
import SurfingLoading from "../animations/surfingLoading";
import ReactMarkdown from "react-markdown";

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function ChatMessages() {
  const context = useContext(chatContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!context)
    throw new Error("chatContext in ChatMessages component is not working");

  const { messages, isLoading } = context;

  const [copy, setCopy] = useState<boolean>(false);

  useEffect(() => {
    if (copy) {
      setTimeout(() => setCopy(false), 2000);
    }
  }, [copy]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 h-full px-4">
        <p
          className={`${dmSans.className} text-8xl font-medium 
                     text-neutral-800 dark:text-neutral-200
                     transition-colors duration-200`}
        >
          (✦‿✦)
        </p>
        <p
          className={`${dmSans.className} text-2xl font-medium 
                     text-neutral-800 dark:text-neutral-200
                     transition-colors duration-200 text-center`}
        >
          Start a conversation!
        </p>
        <p
          className={`${dmSans.className} text-[18px] font-light 
                     text-neutral-500 dark:text-neutral-400
                     transition-colors duration-200 text-center max-w-md`}
        >
          Ask questions about your files and get instant answers. Select a file
          from by typing @ and your prefered document
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-y-auto
                    scrollbar-thin scrollbar-track-transparent
                    scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300
                    dark:scrollbar-thumb-neutral-800 dark:hover:scrollbar-thumb-neutral-700
                    transition-colors duration-200"
    >
      <div className="flex flex-col items-center w-full py-16 md:py-8 space-y-3">
        <div className="w-[93%] md:w-[60%] mx-auto">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            if (isUser) {
              return (
                <div
                  key={`${message.role}-${index}`}
                  className="space-y-2 bg-black/5 dark:bg-white/5 p-3 rounded-lg w-fit "
                >
                  <p
                    className={`${libreBaskerville.className} text-md font-normal text-neutral-700 dark:text-neutral-400`}
                  >
                    {message.content}
                  </p>
                </div>
              );
            } else {
              return (
                <div
                  key={`${message.role}-${index}`}
                  className="space-y-2 p-3 pb-10 "
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      setCopy(true);
                    }}
                  >
                    {!copy ? (
                      <Copy
                        className="text-neutral-400 dark:text-neutral-500 
                     hover:text-neutral-700 dark:hover:text-neutral-300 
                     transition-colors duration-200 cursor-pointer"
                        height={18}
                        width={18}
                      />
                    ) : (
                      <Check
                        className="text-neutral-400 dark:text-neutral-500 
                     hover:text-neutral-700 dark:hover:text-neutral-300 
                     transition-colors duration-200 cursor-pointer"
                        height={18}
                        width={18}
                      />
                    )}
                  </div>
                </div>
              );
            }
          })}

          {isLoading && (
            <div className="space-y-2 p-3">
              <SurfingLoading />
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
