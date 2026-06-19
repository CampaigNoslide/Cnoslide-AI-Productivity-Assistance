import { createFileRoute, Outlet, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, MessagesSquare } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  loadThreads,
  saveThreads,
  newThreadId,
  type ChatThread,
} from "@/lib/chat-storage";
import { ChatCtx, type ChatCtxValue } from "@/lib/chat-context";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Atlas" },
      { name: "description", content: "Interactive AI workplace assistant." },
    ],
  }),
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;
  const [threads, setThreadsState] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Idempotent bootstrap: load once on the client.
  useEffect(() => {
    if (hydrated) return;
    const loaded = loadThreads();
    setThreadsState(loaded);
    setHydrated(true);
    // If on /chat (no active id), pick or create one
    if (!activeId) {
      if (loaded.length > 0) {
        const newest = [...loaded].sort((a, b) => b.updatedAt - a.updatedAt)[0];
        navigate({ to: "/chat/$threadId", params: { threadId: newest.id }, replace: true });
      } else {
        const t: ChatThread = {
          id: newThreadId(),
          title: "New chat",
          updatedAt: Date.now(),
          messages: [],
        };
        const next = [t];
        saveThreads(next);
        setThreadsState(next);
        navigate({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThreads = useCallback((fn: (prev: ChatThread[]) => ChatThread[]) => {
    setThreadsState((prev) => {
      const next = fn(prev);
      saveThreads(next);
      return next;
    });
  }, []);

  const onNew = () => {
    const t: ChatThread = {
      id: newThreadId(),
      title: "New chat",
      updatedAt: Date.now(),
      messages: [],
    };
    setThreads((prev) => [t, ...prev]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const onDelete = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (id === activeId) {
      const remaining = threads.filter((t) => t.id !== id);
      if (remaining[0]) {
        navigate({ to: "/chat/$threadId", params: { threadId: remaining[0].id }, replace: true });
      } else {
        navigate({ to: "/chat", replace: true });
      }
    }
  };

  const ctx: ChatCtxValue = { threads, setThreads, activeId };

  return (
    <>
      <AppHeader title="AI Chatbot" subtitle="Atlas, your always-on workplace assistant" />
      <div className="flex min-h-[calc(100svh-3.5rem-3rem)] w-full">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar/40 md:flex md:flex-col">
          <div className="p-3">
            <Button onClick={onNew} className="w-full" size="sm">
              <Plus className="mr-1 h-4 w-4" /> New chat
            </Button>
          </div>
          <ScrollArea className="flex-1 px-2 pb-3">
            <div className="space-y-0.5">
              {threads.length === 0 && hydrated && (
                <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
              )}
              {[...threads]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-md px-1 transition",
                      t.id === activeId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
                    )}
                  >
                    <Link
                      to="/chat/$threadId"
                      params={{ threadId: t.id }}
                      className="flex-1 min-w-0 px-2 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <MessagesSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(t.id)}
                      aria-label="Delete chat"
                      className="opacity-0 group-hover:opacity-100 mr-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatCtx.Provider value={ctx}>
            <Outlet />
          </ChatCtx.Provider>
        </div>
      </div>
    </>
  );
}