import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { planSchedule } from "@/lib/ai.functions";

type Horizon = "Daily" | "Weekly";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — Atlas" },
      { name: "description", content: "Generate prioritized daily and weekly schedules with AI." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("Daily");
  const [output, setOutput] = useState<string | null>(null);
  const fn = useServerFn(planSchedule);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { tasks: tasks.trim(), horizon } }),
    onSuccess: (d) => setOutput(d.text),
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <FeatureShell
      title="AI Task Planner"
      subtitle="Prioritized, time-blocked schedules"
      icon={CalendarClock}
      isLoading={mutation.isPending}
      output={output}
      canRegenerate={tasks.trim().length > 0 && !mutation.isPending}
      onRegenerate={() => mutation.mutate()}
      inputSection={
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Plan for</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as Horizon)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Today</SelectItem>
                <SelectItem value="Weekly">This week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tasks">Tasks, deadlines, and context</Label>
            <Textarea
              id="tasks"
              placeholder={"e.g.\n- Finish Q3 report (due Thursday)\n- Review 3 PRs\n- Prep client demo for Friday\n- 1:1 with manager"}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              className="min-h-[240px]"
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={!tasks.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Planning…" : "Build Schedule"}
          </Button>
        </div>
      }
    />
  );
}