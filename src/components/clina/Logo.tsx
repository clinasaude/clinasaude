import { cn } from "@/lib/utils";

export function Logo({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-xl px-3 py-1.5 font-display text-3xl font-semibold tracking-tight text-primary", onDark && "bg-white", className)}>
      CLINA
    </span>
  );
}
