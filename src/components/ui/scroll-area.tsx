"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function ScrollArea({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-auto", className)}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "rgb(113 113 122 / 0.3) transparent",
      }}
      {...props}
    />
  );
}
