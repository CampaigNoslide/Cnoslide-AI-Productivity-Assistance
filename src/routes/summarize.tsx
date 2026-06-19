import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeatureShell } from "@/components/feature-shell";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Atlas" },
      { name: "description", content: "Turn long meeting notes into clear summaries, decisions, and action items." },
    ],
  }),
  component: SummarizePage,
});

function SummarizePage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const fn = useServerFn(summarizeMeeting);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes: notes.trim() } }),
    onSuccess: (d) => setOutput(d.text),
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <FeatureShell
      title="Meeting Notes Summarizer"
      subtitle="Key points, decisions, action items, and deadlines"
      icon={FileText}
      isLoading={mutation.isPending}
      output={output}
      canRegenerate={notes.trim().length > 9 && !mutation.isPending}
      onRegenerate={() => mutation.mutate()}
      inputSection={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notes">Paste meeting notes or transcript</Label>
            <Textarea
              id="notes"
              placeholder="Paste raw notes, transcript, or bullet points from your meeting…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[280px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">{notes.length.toLocaleString()} characters</p>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={notes.trim().length < 10 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
      }
    />
  );
}