import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassmorphicCard({ children, className }: GlassmorphicCardProps) {
  return (
    <div 
      className={cn(
        "backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:bg-white/10 transition-all duration-300",
        className
      )}
      data-testid="glassmorphic-card"
    >
      {children}
    </div>
  );
}