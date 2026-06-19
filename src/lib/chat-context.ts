import { createContext, useContext } from "react";
import type { ChatThread } from "./chat-storage";

export type ChatCtxValue = {
  threads: ChatThread[];
  setThreads: (fn: (prev: ChatThread[]) => ChatThread[]) => void;
  activeId: string | undefined;
};

export const ChatCtx = createContext<ChatCtxValue | null>(null);

export function useChatCtx() {
  const c = useContext(ChatCtx);
  if (!c) throw new Error("useChatCtx must be used inside /chat layout");
  return c;
}