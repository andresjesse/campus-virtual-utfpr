/*
 * Medição do tempo de carregamento do mapa (colar no console do DevTools do navegador do aparelho,
 * via depuração remota: chrome://inspect no computador, com o aparelho Android conectado).
 *
 * O script roda numa página em branco do mesmo servidor (/blank.html) e carrega o mapa várias vezes dentro
 * de um iframe, uma carga por vez. Assim, a página que roda o script não desenha o mapa e não disputa a
 * GPU com ele. As marcas de tempo vêm do hook use-virtual-map (map-load-start, map-models-start,
 * map-models-end, map-ready), presentes na branch performance-experiments.
 *
 * Condições (configuradas no DevTools, aba Network, e mantidas durante toda a sequência):
 *   - Limite de rede (throttling) com o mesmo perfil em todos os aparelhos;
 *   - "Disable cache" MARCADO para as cargas com cache vazio e DESMARCADO para as com cache preenchido;
 *   - Screencast (espelhamento da tela) DESATIVADO, pois derruba a taxa de quadros.
 *
 * Uso (nesta ordem):
 *   await carga("frio",   5, { perfil: "descrição do perfil de rede" })   // com "Disable cache" marcado
 *   await carga("quente", 5, { perfil: "descrição do perfil de rede" })   // com "Disable cache" desmarcado
 *   resumoCarga()                               // mediana por fase
 *   copy(JSON.stringify(window.__carga))        // copia todos os resultados
 */
(() => {
  window.__carga = window.__carga || { env: {}, rows: [] };
  window.__carga.env = {
    userAgent: navigator.userAgent,
    dpr: devicePixelRatio,
    viewport: `${innerWidth}x${innerHeight}`,
    connection: navigator.connection
      ? { type: navigator.connection.effectiveType, downlinkMbps: navigator.connection.downlink, rttMs: navigator.connection.rtt }
      : "indisponível",
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const round = (v) => (v == null ? null : Math.round(v));

  // Carrega o mapa uma vez num iframe em tela cheia e devolve as métricas.
  const cargaUnica = async (path, timeoutMs) => {
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;border:0;background:#000";
    document.body.appendChild(frame);
    frame.src = path;
    const t0 = performance.now();
    let win = null;
    let ready = null;
    while (performance.now() - t0 < timeoutMs) {
      await sleep(100);
      try {
        win = frame.contentWindow;
        ready = win.performance.getEntriesByName("map-ready")[0];
      } catch {
        ready = null; // a página ainda está sendo trocada
      }
      if (ready) break;
    }
    if (!ready) {
      frame.remove();
      return { erro: `map-ready não apareceu em ${timeoutMs / 1000} s` };
    }
    await sleep(1000); // deixa os últimos registros de recursos serem gravados
    const perf = win.performance;
    const mark = (n) => perf.getEntriesByName(n)[0]?.startTime;
    const glbs = perf.getEntriesByType("resource").filter((e) => /\.glb(\?|$)/i.test(e.name));
    const lastGlbEnd = glbs.length ? Math.max(...glbs.map((e) => e.responseEnd)) : null;
    const loadStart = mark("map-load-start");
    const modelsStart = mark("map-models-start");
    const row = {
      glbCount: glbs.length,
      glbTransferKB: round(glbs.reduce((s, e) => s + e.transferSize, 0) / 1024),
      glbDecodedKB: round(glbs.reduce((s, e) => s + e.decodedBodySize, 0) / 1024),
      // Em recursos de outra origem sem o cabeçalho Timing-Allow-Origin, o navegador zera os tamanhos
      // (transferSize e decodedBodySize). Nesse caso o cache é inferido pela duração (< 30 ms).
      tamanhosOcultos: glbs.length > 0 && glbs.every((e) => e.transferSize === 0 && e.decodedBodySize === 0),
      glbDaCache: glbs.filter((e) =>
        e.transferSize === 0 && e.decodedBodySize === 0 ? e.duration < 30 : e.transferSize === 0,
      ).length,
      loadStartMs: round(loadStart),
      modelsStartMs: round(modelsStart),
      lastGlbEndMs: round(lastGlbEnd),
      readyMs: round(ready.startTime),
      // Derivadas (medidas a partir do início do carregamento do mapa, sem o código do aplicativo):
      mapaProntoMs: round(ready.startTime - loadStart), // do início do mapa até ficar pronto
      downloadMs: lastGlbEnd && modelsStart ? round(lastGlbEnd - modelsStart) : null, // janela de download dos .glb
      processamentoMs: lastGlbEnd ? round(ready.startTime - lastGlbEnd) : null, // pós-download: leitura, clone, 1º desenho
    };
    frame.remove();
    return row;
  };

  // fase: "frio" (cache vazio, "Disable cache" marcado) ou "quente" (cache preenchido, desmarcado).
  window.carga = async (fase, n = 5, { perfil = "não informado", path = "/", pauseMs = 30000, timeoutMs = 90000 } = {}) => {
    if (fase !== "frio" && fase !== "quente") throw new Error('fase deve ser "frio" ou "quente"');
    console.log(`Fase ${fase}: ${n} cargas | perfil de rede: ${perfil}`);

    if (fase === "quente") {
      console.log("Aquecimento: uma carga para preencher o cache (não entra nos resultados)");
      await cargaUnica(path, timeoutMs);
      await sleep(pauseMs);
    }

    for (let i = 1; i <= n; i++) {
      console.log(`Carga ${i}/${n}`);
      const r = await cargaUnica(path, timeoutMs);
      if (r.erro) {
        console.warn(r.erro);
        window.__carga.rows.push({ fase, run: i, perfil, timestamp: new Date().toISOString(), erro: r.erro });
      } else {
        // Confere se a condição de cache pedida foi a que ocorreu.
        const todosDaCache = r.glbDaCache === r.glbCount && r.glbCount > 0;
        const nenhumDaCache = r.glbDaCache === 0;
        if (r.tamanhosOcultos) {
          console.warn("Tamanhos ocultos (recurso de outra origem sem Timing-Allow-Origin): volume transferido indisponível.");
        }
        const faseOk = fase === "frio" ? nenhumDaCache && (r.glbTransferKB > 0 || r.tamanhosOcultos) : todosDaCache;
        if (!faseOk) {
          console.warn(
            fase === "frio"
              ? 'Carga fria com arquivos vindos do cache (ou volume 0): confira se "Disable cache" está marcado.'
              : 'Carga quente com arquivos baixados: confira se "Disable cache" está desmarcado.',
          );
        }
        window.__carga.rows.push({ fase, run: i, perfil, timestamp: new Date().toISOString(), faseOk, ...r });
        console.table(r);
      }
      if (i < n) await sleep(pauseMs);
    }
    return window.resumoCarga();
  };

  window.resumoCarga = () => {
    const median = (xs) => {
      const s = xs.filter((x) => x != null).sort((a, b) => a - b);
      if (!s.length) return null;
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(1);
    };
    const resumo = ["frio", "quente"].flatMap((fase) => {
      const rows = window.__carga.rows.filter((r) => r.fase === fase && !r.erro);
      if (!rows.length) return [];
      return [
        {
          fase,
          cargas: rows.length,
          faseOk: rows.filter((r) => r.faseOk).length,
          transferKB: median(rows.map((r) => r.glbTransferKB)),
          mapaProntoMs: median(rows.map((r) => r.mapaProntoMs)),
          downloadMs: median(rows.map((r) => r.downloadMs)),
          processamentoMs: median(rows.map((r) => r.processamentoMs)),
        },
      ];
    });
    console.table(resumo);
    return resumo;
  };

  console.log('Pronto. Use: await carga("frio", 5, { perfil: "..." }), depois await carga("quente", 5, { perfil: "..." }).');
})();
