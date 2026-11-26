import logo from "@/assets/clina-logo.png.asset.json";
import { cn } from "@/lib/utils";

/** Logomarca oficial. Nunca distorcer: só altura definida, largura automática.
 *  Em fundos escuros, a marca é apresentada sobre uma placa clara para preservar as cores. */
export function Logo({ className, onDark }: { className?: string; onDark?: boolean }) {
  const img = <img src={logo.url} alt="CLINA — Sua saúde merece cuidado." className={cn("h-10 w-auto object-contain", className)} />;
  return onDark ? <span className="inline-flex rounded-xl bg-surface px-3 py-1.5">{img}</span> : img;
}