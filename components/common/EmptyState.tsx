import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

type Props = {
  title: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

export function EmptyState({ title, children, className, icon }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-8 text-center",
        "bg-muted/30",
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {children ? <p className="mt-1 text-sm text-muted-foreground">{children}</p> : null}
    </div>
  );
}
