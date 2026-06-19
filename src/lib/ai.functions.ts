import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";

async function runPrompt(system: string, prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt,
    });
    return text;
  } catch (e) {
    const err = e as { statusCode?: number; status?: number; message?: string };
    const status = err.statusCode ?? err.status;
    if (status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
    throw new Error(err.message || "AI request failed.");
  }
}

const EmailSchema = z.object({
  topic: z.string().min(1).max(2000),
  tone: z.enum(["Formal", "Friendly", "Persuasive", "Professional"]),
  recipient: z.string().max(200).optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailSchema.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are an expert business communications writer. Write polished, ready-to-send emails. Output ONLY the email with a subject line on the first line as 'Subject: ...' then a blank line then the body. No commentary.";
    const prompt = `Write a ${data.tone.toLowerCase()} email${data.recipient ? ` to ${data.recipient}` : ""} about:\n\n${data.topic}`;
    return { text: await runPrompt(system, prompt) };
  });

const SummarizeSchema = z.object({ notes: z.string().min(10).max(20000) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SummarizeSchema.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You summarize meeting notes for busy professionals. Output clean Markdown with these exact sections in order: '## Summary', '## Key Discussion Points' (bulleted), '## Decisions Made' (bulleted), '## Action Items' (bulleted with owner if mentioned), '## Deadlines' (bulleted with dates). Be concise and faithful to the source.";
    return { text: await runPrompt(system, data.notes) };
  });

const PlannerSchema = z.object({
  tasks: z.string().min(1).max(10000),
  horizon: z.enum(["Daily", "Weekly"]),
});

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerSchema.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are a productivity coach. Build a realistic, prioritized schedule using the Eisenhower matrix (urgency x importance). Output Markdown with: '## Priorities' (P1/P2/P3 grouping), then '## Schedule' as a time-blocked plan. For daily: hour-by-hour from 9:00 to 18:00. For weekly: Monday-Friday with 2-3 focused blocks per day. End with '## Tips' (3 bullets) to improve productivity for this workload.";
    const prompt = `Plan horizon: ${data.horizon}\n\nTasks and context:\n${data.tasks}`;
    return { text: await runPrompt(system, prompt) };
  });

const ResearchSchema = z.object({ topic: z.string().min(3).max(20000) });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchSchema.parse(d))
  .handler(async ({ data }) => {
    const system =
      "You are an AI research analyst. Given a topic or pasted article, produce Markdown with: '## TL;DR' (2-3 sentences), '## Key Takeaways' (5 bullets), '## Trends & Signals' (bulleted), '## Insights & Recommendations' (bulleted, actionable), '## Open Questions' (bulleted). Be specific. If the input is sparse, expand with widely accepted knowledge but flag uncertainty.";
    return { text: await runPrompt(system, data.topic) };
  });