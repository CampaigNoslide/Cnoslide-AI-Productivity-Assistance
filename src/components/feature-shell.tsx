import { type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function FeatureShell({
  title,
  subtitle,
  icon: Icon,
  inputSection,
  output,
  isLoading,
  onRegenerate,
  canRegenerate,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  inputSection: ReactNode;
  output: string | null;
  isLoading: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}) {
  return (
    <>
      <AppHeader title={title} subtitle={subtitle} />
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold tracking-tight">Input</h2>
              </div>
              {inputSection}
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-tight">AI Output</h2>
                {output && (
                  <OutputActions text={output} onRegenerate={onRegenerate} canRegenerate={canRegenerate} />
                )}
              </div>
              <OutputView text={output} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

function OutputView({ text, isLoading }: { text: string | null; isLoading: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <p className="pt-3 text-xs text-muted-foreground">Atlas is thinking…</p>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Your AI-generated output will appear here.
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => setEditing(false)}>
            <Check className="mr-1 h-4 w-4" /> Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="prose-chat max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/20 p-4 text-sm">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setDraft(text);
          setEditing(true);
        }}
      >
        <Pencil className="mr-1 h-4 w-4" /> Edit
      </Button>
    </div>
  );
}

function OutputActions({
  text,
  onRegenerate,
  canRegenerate,
}: {
  text: string;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        }}
      >
        <Copy className="mr-1 h-4 w-4" /> Copy
      </Button>
      {onRegenerate && (
        <Button variant="ghost" size="sm" disabled={!canRegenerate} onClick={onRegenerate}>
          <RefreshCw className="mr-1 h-4 w-4" /> Regenerate
        </Button>
      )}
    </div>
  );
}