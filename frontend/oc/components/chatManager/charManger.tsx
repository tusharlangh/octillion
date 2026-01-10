"use client";

import { useChatQuery, Message } from "@/hooks/useChatQuery";
import { createContext } from "react";

interface QueryContextProps {
  search: string;
  setSearch: (string: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const chatContext = createContext<QueryContextProps | undefined>(
  undefined
);

interface ChatManagerProps {
  children: React.ReactNode;
  fileId?: string | null;
}

export default function ChatManager({
  children,
  fileId: propFileId,
}: ChatManagerProps) {
  const { search, setSearch, messages, setMessages, isLoading, setIsLoading } =
    useChatQuery();

  return (
    <chatContext.Provider
      value={{
        search,
        setSearch,
        messages,
        setMessages,
        isLoading,
        setIsLoading,
      }}
    >
      <div className="h-full w-full">{children}</div>
    </chatContext.Provider>
  );
}
