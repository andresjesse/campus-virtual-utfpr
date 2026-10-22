import { useEffect, useState } from "react";

export function useDelayedFlag(active: boolean, delayMs: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => setElapsed(true), delayMs);

    return () => {
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, delayMs]);

  return active && elapsed;
}
