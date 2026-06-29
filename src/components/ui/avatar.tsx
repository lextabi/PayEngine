import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-sm font-semibold", className)} {...props} />
  );
}
