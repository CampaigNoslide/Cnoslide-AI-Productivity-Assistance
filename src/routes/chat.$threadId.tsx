import { createFileRoute, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, User as UserIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useChatCtx } from "@/lib/chat-context";
import { deriveTitle } from "@/lib/chat-storage";
import { toast } from "sonner";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

const SUGGESTIONS = [
  "Draft a polite follow-up email to a client about a delayed deliverable.",
  "Summarize this meeting: …",
  "Plan my day: I have a demo at 2pm and 3 PRs to review.",
  "What are the latest trends in AI productivity tools?",
];

function ChatThreadPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const { threads, setThreads } = useChatCtx();

  const thread = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);
  const initialMessages: UIMessage[] = thread?.messages ?? [];

  return (
    <ChatWindow
      key={threadId}
      threadId={threadId}
      initialMessages={initialMessages}
      onPersist={(messages, status) => {
        setThreads((prev) => {
          const existing = prev.find((t) => t.id === threadId);
          const title = existing && existing.title !== "New chat" ? existing.title : deriveTitle(messages);
          const updated = {
            id: threadId,
            title,
            updatedAt: Date.now(),
            messages,
          };
          const others = prev.filter((t) => t.id !== threadId);
          // Only persist when at rest to avoid every-token writes
          if (status === "ready" || status === "error") {
            return [updated, ...others];
          }
          // While streaming, keep the existing snapshot but bump title for first user msg
          if (!existing || (existing.title === "New chat" && title !== "New chat")) {
            return [updated, ...others];
          }
          return prev;
        });
      }}
    />
  );
}

function ChatWindow({
  threadId,
  initialMessages,
  onPersist,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  onPersist: (messages: UIMessage[], status: string) => void;
}) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  // Persist on changes
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;
  useEffect(() => {
    persistRef.current(messages, status);
  }, [messages, status]);

  // Focus textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    const el = document.querySelector<HTMLTextAreaElement>("textarea[data-chat-input]");
    el?.focus();
    textareaRef.current = el;
  }, [threadId, status]);

  const handleSubmit = async ({ text }: { text?: string }) => {
    const value = (text ?? "").trim();
    if (!value) return;
    await sendMessage({ text: value });
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-[calc(100svh-3.5rem-3rem)] flex-1 flex-col">
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </div>
              }
              title="How can Atlas help today?"
              description="Ask anything about your work — drafting, summarizing, planning, or research."
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold">How can Atlas help today?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask anything about your work — drafting, summarizing, planning, or research.
                </p>
              </div>
              <div className="mt-4 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-lg border border-border bg-card p-3 text-left text-xs text-foreground/80 shadow-soft transition hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                {m.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <div className="grid h-5 w-5 place-items-center rounded-md bg-primary/10 text-primary">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    Atlas
                  </div>
                )}
                <MessageContent>
                  {m.role === "assistant" ? (
                    <div className="prose-chat">
                      <ReactMarkdown>{m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <Message from="assistant">
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <div className="grid h-5 w-5 place-items-center rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-3 w-3" />
                </div>
                Atlas
              </div>
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="border-t border-border bg-background/60 p-3 sm:p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              data-chat-input
              placeholder="Message Atlas…"
              disabled={isLoading}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

// silence unused import warning
void UserIcon;