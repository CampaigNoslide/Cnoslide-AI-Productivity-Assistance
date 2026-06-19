import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeatureShell } from "@/components/feature-shell";
import { generateEmail } from "@/lib/ai.functions";

const TONES = ["Formal", "Friendly", "Persuasive", "Professional"] as const;
type Tone = (typeof TONES)[number];

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Atlas" },
      { name: "description", content: "Draft polished, ready-to-send emails with AI." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [topic, setTopic] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [output, setOutput] = useState<string | null>(null);
  const fn = useServerFn(generateEmail);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { topic: topic.trim(), tone, recipient: recipient.trim() || undefined } }),
    onSuccess: (data) => setOutput(data.text),
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <FeatureShell
      title="Smart Email Generator"
      subtitle="Polished emails in seconds"
      icon={Mail}
      isLoading={mutation.isPending}
      output={output}
      canRegenerate={topic.trim().length > 0 && !mutation.isPending}
      onRegenerate={() => mutation.mutate()}
      inputSection={
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                placeholder="e.g. Hiring manager at Acme"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="topic">What should the email say?</Label>
            <Textarea
              id="topic"
              placeholder="e.g. Follow up on yesterday's interview and ask about next steps."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[180px]"
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={!topic.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Generating…" : "Generate Email"}
          </Button>
        </div>
      }
    />
  );
}