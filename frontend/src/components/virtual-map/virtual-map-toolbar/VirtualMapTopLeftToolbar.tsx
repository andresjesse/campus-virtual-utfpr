import { QuestionIcon } from "@phosphor-icons/react/dist/csr/Question";

import VirtualMapToolbar from "@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbar.tsx";
import VirtualMapToolbarButton from "@/components/virtual-map/virtual-map-toolbar/VirtualMapToolbarButton.tsx";
import messages from "@/constants/messages.json";
import { restartTour } from "@/helpers/virtual-map-tour-helper.ts";

export default function VirtualMapTopLeftToolbar() {
  return (
    <VirtualMapToolbar position="top-left">
      <VirtualMapToolbarButton
        icon={QuestionIcon}
        label={messages.virtualMap.tour.restartLabel}
        onClick={() => restartTour()}
      />
    </VirtualMapToolbar>
  );
}
