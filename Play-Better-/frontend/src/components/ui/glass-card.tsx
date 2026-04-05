import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      "glass-morphism rounded-2xl p-6 backdrop-blur-lg border border-white/20",
      "bg-white/10 shadow-xl",
      className
    )}>
      {children}
    </div>
  );
}
