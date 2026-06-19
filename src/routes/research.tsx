import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeatureShell } from "@/components/feature-shell";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Atlas" },
      { name: "description", content: "Summarize articles and topics. Highlight trends, takeaways, and recommendations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const fn = useServerFn(researchTopic);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { topic: topic.trim() } }),
    onSuccess: (d) => setOutput(d.text),
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <FeatureShell
      title="AI Research Assistant"
      subtitle="Insights, trends, and recommendations"
      icon={BookOpen}
      isLoading={mutation.isPending}
      output={output}
      canRegenerate={topic.trim().length > 2 && !mutation.isPending}
      onRegenerate={() => mutation.mutate()}
      inputSection={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="topic">Topic or pasted article</Label>
            <Textarea
              id="topic"
              placeholder="e.g. The state of AI agents in enterprise software in 2026 — or paste an article to analyze."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[260px]"
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={topic.trim().length < 3 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Researching…" : "Research"}
          </Button>
        </div>
      }
    />
  );
}