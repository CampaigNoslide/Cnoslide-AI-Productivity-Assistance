import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Atlas, an AI workplace productivity assistant. You help professionals draft communications, summarize meetings, plan their time, and research topics. Be concise, structured, and pragmatic. Use Markdown (headings, bullets, bold) for any non-trivial answer. When asked for opinions or recommendations, give them clearly. Never invent confidential facts; if unsure, say so.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);
        const messages = body.messages as UIMessage[];

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          onError: (error) => {
            const e = error as { statusCode?: number; message?: string };
            if (e?.statusCode === 429) return "Rate limit reached. Please try again shortly.";
            if (e?.statusCode === 402) return "AI credits exhausted. Add credits to continue.";
            return e?.message || "Something went wrong.";
          },
        });
        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});