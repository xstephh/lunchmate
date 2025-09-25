import * as React from "react";
import { cn } from "/Users/stephanie/lunchmate/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
export { Input };
