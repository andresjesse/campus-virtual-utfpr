/**
 * Medição automática de desempenho do mapa, usada apenas na branch de experimentos (sem testes automatizados).
 *
 * Uso (abrir a URL do mapa no aparelho, sem DevTools conectado):
 *   ?bench=start                      -> percorre as 9 configurações padrão e o controle final
 *   ?bench=start&configs=padrao|staticshadow|staticshadow,dpr1
 *                                     -> percorre a lista informada (separada por "|"; "padrao" = sem ?exp=)
 *   ?bench=results                    -> mostra os resultados guardados (para baixar em JSON ou CSV)
 *   ?bench=clear                      -> apaga os resultados guardados
 *
 * Para cada configuração: aguarda o mapa ficar pronto, faz N rodadas de [repouso, órbita automática],
 * guarda tudo no localStorage, recarrega a página com a próxima configuração e, ao final, oferece o download.
 */
import { markTourCompleted } from "@/helpers/virtual-map-tour-helper.ts";

const STORAGE_KEY = "vm-benchmark";

const DEFAULT_CONFIGS = [
  "padrao",
  "staticshadow",
  "dpr1",
  "noshadow",
  "noaa",
  "shadow1024",
  "staticshadow,dpr1",
  "noshadow,dpr1",
  "noshadow,dpr15",
  "padrao", // controle: repete o padrão no fim para detectar aquecimento do aparelho
];

const SETTINGS = {
  runs: 5,
  durationMs: 15000,
  pauseBetweenRunsMs: 60000,
  pauseBetweenConfigsMs: 180000,
  settleMs: 5000,
};

type Row = {
  configIndex: number;
  config: string;
  run: number;
  scenario: "repouso" | "orbita";
  timestamp: string;
  frames: number;
  fpsMean: number;
  fpsMin: number;
  frameTimeP95Ms: number;
  frameTimeP99Ms: number;
  pctFramesOver33ms: number;
  pageHidden: boolean;
};

type BenchmarkState = {
  configs: string[];
  index: number;
  done: boolean;
  startedAt: string;
  settings: typeof SETTINGS;
  env: Record<string, unknown>;
  rows: Row[];
};

type Mode = "start" | "run" | "results" | "clear" | null;

function getMode(): Mode {
  const value = new URLSearchParams(window.location.search).get("bench");
  return value === "start" || value === "run" || value === "results" || value === "clear" ? value : null;
}

/** Verdadeiro quando a página está em modo de medição (usado para esconder o contador de FPS). */
export function isBenchmarkActive(): boolean {
  const mode = getMode();
  return mode === "start" || mode === "run";
}

function loadState(): BenchmarkState | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BenchmarkState) : null;
}

function saveState(state: BenchmarkState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function collectEnv(): Record<string, unknown> {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
  const debug = gl?.getExtension("WEBGL_debug_renderer_info");
  return {
    userAgent: navigator.userAgent,
    gpu: gl && debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : "indisponível",
    cores: navigator.hardwareConcurrency,
    dpr: window.devicePixelRatio,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
}

function urlFor(config: string, mode: "run"): string {
  const params = new URLSearchParams();
  if (config !== "padrao") params.set("exp", config);
  params.set("bench", mode);
  return `${window.location.pathname}?${params.toString()}`;
}

// ---------------------------------------------------------------------------------------------- painel

let panel: HTMLDivElement | null = null;

function showPanel(lines: string[], buttons: { label: string; onClick: () => void }[] = []) {
  if (!panel) {
    panel = document.createElement("div");
    panel.style.cssText =
      "position:fixed;left:8px;bottom:8px;z-index:99999;max-width:90vw;padding:8px 12px;border-radius:8px;" +
      "background:rgba(0,0,0,.8);color:#fff;font:12px monospace;white-space:pre-wrap;";
    document.body.appendChild(panel);
  }
  panel.textContent = lines.join("\n");
  for (const { label, onClick } of buttons) {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.cssText = "display:block;margin-top:6px;padding:6px 10px;font:12px monospace;";
    button.onclick = onClick;
    panel.appendChild(button);
  }
}

// ---------------------------------------------------------------------------------------------- medição

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function countdown(prefix: string, ms: number) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    showPanel([`${prefix}`, `Aguardando ${Math.ceil((end - performance.now()) / 1000)} s`]);
    await wait(1000);
  }
}

function measureFrames(durationMs: number): Promise<Omit<Row, "configIndex" | "config" | "run" | "scenario">> {
  return new Promise((resolve) => {
    const deltas: number[] = [];
    let last: number | null = null;
    let pageHidden = false;
    const onVisibility = () => {
      if (document.hidden) pageHidden = true;
    };
    document.addEventListener("visibilitychange", onVisibility);
    const start = performance.now();

    const tick = (t: number) => {
      if (last !== null) deltas.push(t - last);
      last = t;
      if (t - start < durationMs) {
        requestAnimationFrame(tick);
        return;
      }
      document.removeEventListener("visibilitychange", onVisibility);
      const sorted = [...deltas].sort((a, b) => a - b);
      const pct = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
      const total = deltas.reduce((sum, d) => sum + d, 0);
      resolve({
        timestamp: new Date().toISOString(),
        frames: deltas.length,
        fpsMean: +((deltas.length / total) * 1000).toFixed(1),
        fpsMin: +(1000 / sorted[sorted.length - 1]).toFixed(1),
        frameTimeP95Ms: +pct(0.95).toFixed(1),
        frameTimeP99Ms: +pct(0.99).toFixed(1),
        pctFramesOver33ms: +((deltas.filter((d) => d > 33.4).length / deltas.length) * 100).toFixed(1),
        pageHidden,
      });
    };
    requestAnimationFrame(tick);
  });
}

/** Simula um arraste de ponteiro no canvas (varredura horizontal senoidal com leve inclinação vertical). */
async function measureOrbit(durationMs: number) {
  const canvas = document.querySelector("canvas");
  if (!canvas) throw new Error("canvas não encontrado");
  // O OrbitControls chama setPointerCapture, que falharia com eventos sintéticos.
  canvas.setPointerCapture = () => undefined;
  canvas.releasePointerCapture = () => undefined;
  canvas.hasPointerCapture = () => false;

  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const ampX = rect.width * 0.3;
  const ampY = rect.height * 0.1;
  const periodMs = 4000;
  const init = { bubbles: true, cancelable: true, pointerId: 1, pointerType: "mouse", isPrimary: true, button: 0 };
  const at = (x: number, y: number, buttons: number) => ({ ...init, clientX: x, clientY: y, buttons });

  canvas.dispatchEvent(new PointerEvent("pointerdown", at(cx, cy, 1)));
  const t0 = performance.now();
  let stop = false;
  const move = (t: number) => {
    if (stop) return;
    const k = (2 * Math.PI * (t - t0)) / periodMs;
    document.dispatchEvent(new PointerEvent("pointermove", at(cx + ampX * Math.sin(k), cy + ampY * Math.sin(k / 2), 1)));
    requestAnimationFrame(move);
  };
  requestAnimationFrame(move);

  const result = await measureFrames(durationMs);
  stop = true;
  document.dispatchEvent(new PointerEvent("pointerup", at(cx, cy, 0)));
  return result;
}

// ---------------------------------------------------------------------------------------------- resultados

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : +((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
}

function summarize(rows: Row[]) {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    const key = `${row.configIndex}|${row.config}|${row.scenario}`;
    groups.set(key, [...(groups.get(key) ?? []), row.fpsMean]);
  }
  return [...groups].map(([key, values]) => {
    const [configIndex, config, scenario] = key.split("|");
    return { configIndex: Number(configIndex), config, scenario, runs: values.length, median: median(values) };
  });
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Row[]): string {
  const columns = Object.keys(rows[0] ?? {}) as (keyof Row)[];
  const escape = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
  return [columns.join(","), ...rows.map((row) => columns.map((c) => escape(row[c])).join(","))].join("\n");
}

function showResults(state: BenchmarkState) {
  const summary = summarize(state.rows)
    .map((s) => `${s.configIndex}. ${s.config} | ${s.scenario}: ${s.median} FPS (n=${s.runs})`)
    .join("\n");
  const stamp = state.startedAt.replace(/[:.]/g, "-");
  showPanel(
    [state.done ? "Medição concluída." : "Medição incompleta.", summary],
    [
      {
        label: "Baixar JSON",
        onClick: () =>
          download(`benchmark-${stamp}.json`, JSON.stringify({ ...state, summary: summarize(state.rows) }, null, 2), "application/json"),
      },
      { label: "Baixar CSV", onClick: () => download(`benchmark-${stamp}.csv`, toCsv(state.rows), "text/csv") },
      {
        label: "Apagar resultados guardados",
        onClick: () => {
          window.localStorage.removeItem(STORAGE_KEY);
          window.location.replace(window.location.pathname);
        },
      },
    ],
  );
}

// ---------------------------------------------------------------------------------------------- fluxo

/** Chamado quando o mapa fica pronto. Sem o parâmetro `bench`, não faz nada. */
export async function runBenchmarkIfRequested(): Promise<void> {
  const mode = getMode();
  if (!mode) return;

  if (mode === "clear") {
    window.localStorage.removeItem(STORAGE_KEY);
    showPanel(["Resultados apagados."]);
    return;
  }

  if (mode === "results") {
    const saved = loadState();
    if (saved) showResults(saved);
    else showPanel(["Nenhum resultado guardado."]);
    return;
  }

  if (mode === "start") {
    const param = new URLSearchParams(window.location.search).get("configs");
    const configs = param ? param.split("|").map((c) => c.trim()) : DEFAULT_CONFIGS;
    saveState({
      configs,
      index: 0,
      done: false,
      startedAt: new Date().toISOString(),
      settings: SETTINGS,
      env: collectEnv(),
      rows: [],
    });
    markTourCompleted(); // evita o tutorial durante a medição
    window.location.replace(urlFor(configs[0], "run"));
    return;
  }

  const state = loadState();
  if (!state || state.done) {
    showPanel(["Sem medição em andamento. Use ?bench=start."]);
    return;
  }

  // Mantém a tela ligada, quando o navegador permite (exige contexto seguro).
  void (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<unknown> } }).wakeLock
    ?.request("screen")
    .catch(() => undefined);

  const config = state.configs[state.index];
  // Descarta resultados parciais desta configuração, caso a página tenha sido recarregada no meio dela.
  state.rows = state.rows.filter((row) => row.configIndex !== state.index);

  const label = (extra: string) => `Config ${state.index + 1}/${state.configs.length}: ${config}\n${extra}`;
  await countdown(label("Aguardando o mapa estabilizar"), state.index === 0 ? SETTINGS.settleMs : SETTINGS.pauseBetweenConfigsMs);

  for (let run = 1; run <= SETTINGS.runs; run++) {
    for (const scenario of ["repouso", "orbita"] as const) {
      showPanel([label(`Execução ${run}/${SETTINGS.runs}: ${scenario}`)]);
      await wait(200);
      const metrics = scenario === "repouso" ? await measureFrames(SETTINGS.durationMs) : await measureOrbit(SETTINGS.durationMs);
      state.rows.push({ configIndex: state.index, config, run, scenario, ...metrics });
    }
    saveState(state);
    if (run < SETTINGS.runs) await countdown(label(`Execução ${run}/${SETTINGS.runs} concluída`), SETTINGS.pauseBetweenRunsMs);
  }

  state.index += 1;
  if (state.index >= state.configs.length) {
    state.done = true;
    saveState(state);
    showResults(state);
    return;
  }
  saveState(state);
  window.location.replace(urlFor(state.configs[state.index], "run"));
}
