// app/loading.tsx
import { Spinner } from "@/components/ui/spinner";

export default function RootLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner />
        <span>Loading Lunchmate…</span>
      </div>
    </div>
  );
}
