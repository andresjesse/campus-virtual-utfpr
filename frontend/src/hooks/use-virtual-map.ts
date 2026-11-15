import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState, type RefObject } from "react";
import { Raycaster, type Object3D, type Vector2 } from "three";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_EVENTS, VIRTUAL_MAP_HIGHLIGHT } from "@/constants/virtual-map-constants.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { parseVirtualMapExperiment } from "@/helpers/virtual-map-experiment-helper.ts";
import { virtualMapStats } from "@/helpers/virtual-map-stats.ts";
import { virtualMapEventBus } from "@/helpers/virtual-map-event-bus.ts";
import {
  applyEdgeFade,
  applyEntityHighlight,
  applyEntityTransform,
  createVirtualMapScene,
  disposeObject3D,
  enableShadows,
  groupEntitiesByMesh,
  isPointerClick,
  loadModels,
  pickEntity,
  pickEntityRoot,
  setPickableEntity,
  toNormalizedPointer,
  type MeshEntityGroup,
} from "@/helpers/virtual-map-scene-helper.ts";
import { listEntityIdsWithPage } from "@/services/content-page-service.ts";
import { listActiveEntities } from "@/services/entity-service.ts";
import { getMeshFileUrl } from "@/services/mesh-service.ts";
import type { VirtualMapStatus } from "@/types/virtual-map-status.ts";

/** Marcador de tempo para os experimentos de desempenho; ignorado onde a API não existe (ex.: testes em jsdom). */
function markPerformance(name: string) {
  if (typeof performance !== "undefined" && typeof performance.mark === "function") performance.mark(name);
}

export function useVirtualMap(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [status, setStatus] = useState<VirtualMapStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const experiment = parseVirtualMapExperiment(window.location.search);
    let needsRender = true;
    const { renderer, scene, camera, controls } = createVirtualMapScene(canvas, experiment);
    const container = canvas.parentElement ?? canvas;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      needsRender = true;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const pickable: Object3D[] = [];
    const raycaster = new Raycaster();
    let pointerDown: PointerEvent | null = null;
    let hoverPointer: Vector2 | null = null;
    let hovered: Object3D | null = null;
    let restoreHovered: (() => void) | null = null;

    const setHovered = (root: Object3D | null) => {
      if (root === hovered) return;
      needsRender = true;

      restoreHovered?.();
      restoreHovered = root
        ? applyEntityHighlight(
            root,
            branding.colors.scene.entityHighlight,
            VIRTUAL_MAP_HIGHLIGHT.emissiveIntensity,
          )
        : null;
      hovered = root;
      canvas.style.cursor = root ? "pointer" : "";
    };
    const clearHover = () => {
      hoverPointer = null;
      setHovered(null);
    };

    renderer.setAnimationLoop(() => {
      if (hoverPointer) {
        setHovered(pickEntityRoot(raycaster, hoverPointer, camera, pickable));
        hoverPointer = null;
      }
      const moved = controls.update();
      if (experiment.onDemand && !moved && !needsRender) return;

      needsRender = false;
      renderer.render(scene, camera);
      virtualMapStats.drawCalls = renderer.info.render.calls;
      virtualMapStats.triangles = renderer.info.render.triangles;
    });

    const handlePointerDown = (event: PointerEvent) => {
      pointerDown = event.button === 0 ? event : null;
      clearHover();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (pointerDown && !isPointerClick(pointerDown, event)) pointerDown = null;

      if (event.pointerType !== "mouse" || event.buttons !== 0) clearHover();
      else hoverPointer = toNormalizedPointer(event, canvas);
    };
    const handlePointerUp = (event: PointerEvent) => {
      const down = pointerDown;
      pointerDown = null;
      if (!down || !isPointerClick(down, event)) return;

      const entity = pickEntity(raycaster, toNormalizedPointer(event, canvas), camera, pickable);
      if (entity) virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, entity);
      else virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED);
    };
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", clearHover);

    const load = async () => {
      markPerformance("map-load-start");
      let groups: MeshEntityGroup[];
      let entityIdsWithPage: Set<string>;
      try {
        const [entities, pageEntityIds] = await Promise.all([
          listActiveEntities(),
          listEntityIdsWithPage(),
        ]);
        groups = groupEntitiesByMesh(entities);
        entityIdsWithPage = pageEntityIds;
      } catch (requestError) {
        if (disposed) return;
        setError(getRequestErrorMessage(requestError));
        setStatus("error");
        return;
      }

      markPerformance("map-models-start");
      const results = await loadModels(
        groups.map((group) => getMeshFileUrl(group.mesh)),
        (percent) => {
          if (!disposed) setProgress(percent);
        },
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") return;

        const model = result.value.scene;
        if (disposed) {
          disposeObject3D(model);
          return;
        }

        groups[index].entities.forEach((entity) => {
          const instance = model.clone();
          applyEntityTransform(instance, entity);
          enableShadows(instance);
          applyEdgeFade(instance);
          scene.add(instance);
          if (!entityIdsWithPage.has(entity.id)) return;

          setPickableEntity(instance, entity);
          pickable.push(instance);
        });
      });

      markPerformance("map-models-end");

      if (disposed) return;

      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount > 0) {
        notifications.show({
          color: branding.colors.feedback.warning,
          title: messages.virtualMap.viewer.modelsFailedTitle,
          message: formatMessage(messages.virtualMap.viewer.modelsFailedMessage, String(failedCount)),
        });
      }

      renderer.shadowMap.needsUpdate = true;
      needsRender = true;
      markPerformance("map-ready");
      setStatus("ready");
    };

    void load();

    return () => {
      disposed = true;
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", clearHover);
      clearHover();
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      disposeObject3D(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [canvasRef, reloadKey]);

  const retry = useCallback(() => {
    setError("");
    setProgress(0);
    setStatus("loading");
    setReloadKey((key) => key + 1);
  }, []);

  return { status, progress, error, retry };
}
