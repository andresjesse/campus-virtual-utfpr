import { useEffect, useState } from "react";

export function useFramesPerSecond(sampleMs = 500) {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frames = 0;
    let windowStart = performance.now();
    let handle = requestAnimationFrame(function tick(now) {
      frames += 1;
      if (now - windowStart >= sampleMs) {
        setFps(Math.round((frames * 1000) / (now - windowStart)));
        frames = 0;
        windowStart = now;
      }
      handle = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(handle);
  }, [sampleMs]);

  return fps;
}
