import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState, type RefObject } from "react";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { formatMessage } from "@/helpers/message-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import {
  applyEntityTransform,
  createVirtualMapScene,
  disposeObject3D,
  enableShadows,
  groupEntitiesByMesh,
  loadModels,
  type MeshEntityGroup,
} from "@/helpers/virtual-map-scene-helper.ts";
import { listActiveEntities } from "@/services/entity-service.ts";
import { getMeshFileUrl } from "@/services/mesh-service.ts";

export type VirtualMapStatus = "loading" | "ready" | "error";

export function useVirtualMap(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [status, setStatus] = useState<VirtualMapStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const { renderer, scene, camera, controls } = createVirtualMapScene(canvas);
    const container = canvas.parentElement ?? canvas;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    const load = async () => {
      let groups: MeshEntityGroup[];
      try {
        groups = groupEntitiesByMesh(await listActiveEntities());
      } catch (requestError) {
        if (disposed) return;
        setError(getRequestErrorMessage(requestError));
        setStatus("error");
        return;
      }

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
          scene.add(instance);
        });
      });

      if (disposed) return;

      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount > 0) {
        notifications.show({
          color: branding.colors.feedback.warning,
          title: messages.virtualMap.viewer.modelsFailedTitle,
          message: formatMessage(messages.virtualMap.viewer.modelsFailedMessage, String(failedCount)),
        });
      }

      setStatus("ready");
    };

    void load();

    return () => {
      disposed = true;
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
