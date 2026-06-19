import { createFileRoute } from "@tanstack/react-router";

// The parent /chat layout handles redirect to a thread on mount.
export const Route = createFileRoute("/chat/")({
  component: () => (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
      Loading conversation…
    </div>
  ),
});