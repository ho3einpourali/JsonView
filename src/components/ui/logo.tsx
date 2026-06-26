"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  gradient?: boolean;
}

export function Logo({ size = 32, className, gradient = true }: LogoProps) {
  const id = "logo-gradient";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        {gradient && (
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        )}
      </defs>
      {/* Left brace { */}
      <path
        d="M14.5 8C11.5 8 10 9.5 10 12V17C10 18.5 9 19 8 19C9 19 10 19.5 10 21V26C10 28.5 11.5 30 14.5 30"
        stroke={gradient ? `url(#${id})` : "currentColor"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right brace } */}
      <path
        d="M25.5 8C28.5 8 30 9.5 30 12V17C30 18.5 31 19 32 19C31 19 30 19.5 30 21V26C30 28.5 28.5 30 25.5 30"
        stroke={gradient ? `url(#${id})` : "currentColor"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Colon dots */}
      <circle
        cx="20"
        cy="14"
        r="1.8"
        fill={gradient ? `url(#${id})` : "currentColor"}
      />
      <circle
        cx="20"
        cy="26"
        r="1.8"
        fill={gradient ? `url(#${id})` : "currentColor"}
      />
    </svg>
  );
}
