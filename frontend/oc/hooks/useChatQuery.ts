import { useState } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useChatQuery() {
  const [search, setSearch] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return {
    search,
    setSearch,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
  };
}
