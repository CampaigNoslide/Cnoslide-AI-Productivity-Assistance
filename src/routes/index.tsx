import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  BookOpen,
  MessagesSquare,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas" },
      { name: "description", content: "Your AI workplace productivity command center." },
      { property: "og:title", content: "Dashboard — Atlas" },
      { property: "og:description", content: "Your AI workplace productivity command center." },
    ],
  }),
  component: Index,
});

const tools = [
  { title: "Smart Email Generator", desc: "Draft polished emails in seconds.", url: "/email", icon: Mail },
  { title: "Meeting Summarizer", desc: "Decisions, action items, and deadlines from any transcript.", url: "/summarize", icon: FileText },
  { title: "Task Planner", desc: "Prioritized daily & weekly schedules.", url: "/planner", icon: CalendarClock },
  { title: "Research Assistant", desc: "Summaries, trends, and recommendations.", url: "/research", icon: BookOpen },
  { title: "AI Chatbot", desc: "Your always-on workplace co-pilot.", url: "/chat", icon: MessagesSquare },
];

const metrics = [
  { label: "Hours saved this week", value: "12.4", trend: "+18%", icon: Clock },
  { label: "Tasks completed", value: "47", trend: "+9%", icon: CheckCircle2 },
  { label: "AI actions run", value: "186", trend: "+32%", icon: Zap },
  { label: "Productivity score", value: "92", trend: "+5", icon: TrendingUp },
];

function Index() {
  return (
    <>
      <AppHeader title="Dashboard" subtitle="Your AI workplace at a glance" />
      <main className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-primary p-6 text-primary-foreground shadow-glow sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-4 border-white/20 bg-white/15 text-primary-foreground hover:bg-white/20">
              Powered by Lovable AI
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back. Let's make today productive.
            </h2>
            <p className="mt-2 max-w-xl text-sm opacity-90 sm:text-base">
              Draft emails, summarize meetings, plan your week, and research topics — all from one
              clean, fast workspace.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/chat"
                className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm transition hover:bg-white/95"
              >
                Open AI Chatbot <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/email"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/20"
              >
                Write an email
              </Link>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Productivity metrics</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {metrics.map((m) => (
              <Card key={m.label} className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <m.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {m.trend}
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight">{m.value}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">AI tools</h3>
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((t) => (
              <Link
                key={t.title}
                to={t.url}
                className="group rounded-xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="truncate font-semibold tracking-tight">{t.title}</h4>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
