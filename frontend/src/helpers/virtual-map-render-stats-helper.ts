export function createFrameRateSampler(sampleMs: number) {
  let frames = 0;
  let windowStart: number | null = null;

  return (time: number): number | null => {
    if (windowStart === null) {
      windowStart = time;
      return null;
    }

    frames += 1;
    const elapsed = time - windowStart;
    if (elapsed < sampleMs) return null;

    const fps = Math.round((frames * 1000) / elapsed);
    frames = 0;
    windowStart = time;
    return fps;
  };
}
