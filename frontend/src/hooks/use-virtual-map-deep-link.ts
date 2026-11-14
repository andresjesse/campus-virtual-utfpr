import { notifications } from "@mantine/notifications";
import { useEffect, useEffectEvent } from "react";
import { useNavigate, useParams } from "react-router";

import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { VIRTUAL_MAP_EVENTS } from "@/constants/virtual-map-constants.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { virtualMapEventBus } from "@/helpers/virtual-map-event-bus.ts";
import { getContentPageByEntity } from "@/services/content-page-service.ts";
import { getActiveEntityBySlug } from "@/services/entity-service.ts";

export function useVirtualMapDeepLink(isMapReady: boolean, selectedSlug: string | null) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const getSelectedSlug = useEffectEvent(() => selectedSlug);

  useEffect(() => {
    const unregisterSelected = virtualMapEventBus.register(
      VIRTUAL_MAP_EVENTS.ENTITY_SELECTED,
      (entity) => {
        if (entity.slug !== slug) navigate(`/map/${entity.slug}`);
      },
    );
    const unregisterCleared = virtualMapEventBus.register(
      VIRTUAL_MAP_EVENTS.SELECTION_CLEARED,
      () => {
        if (slug) navigate("/");
      },
    );

    return () => {
      unregisterSelected();
      unregisterCleared();
    };
  }, [slug, navigate]);
  
  useEffect(() => {
    if (!slug && getSelectedSlug()) {
      virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug || !isMapReady || slug === getSelectedSlug()) return;

    let cancelled = false;

    async function open(target: string) {
      try {
        const entity = await getActiveEntityBySlug(target);
        const page = entity ? await getContentPageByEntity(entity.id) : null;
        if (cancelled) return;

        if (!entity || !page) {
          notifications.show({
            color: branding.colors.feedback.warning,
            title: messages.virtualMap.deepLink.notFoundTitle,
            message: messages.virtualMap.deepLink.notFoundMessage,
          });
          navigate("/", { replace: true });
          return;
        }

        virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.ENTITY_SELECTED, {
          id: entity.id,
          slug: entity.slug,
        });
      } catch (error) {
        if (cancelled) return;

        notifications.show({
          color: branding.colors.feedback.error,
          title: messages.virtualMap.deepLink.loadErrorTitle,
          message: getRequestErrorMessage(error),
        });
      }
    }

    void open(slug);

    return () => {
      cancelled = true;
    };
  }, [slug, isMapReady, navigate]);
}
