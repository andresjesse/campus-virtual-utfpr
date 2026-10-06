import { Anchor, Box } from "@mantine/core";
import { Link } from "react-router";

import VirtualMapViewer from "@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx";
import messages from "@/constants/messages.json";

export default function Home() {
  return (
    <Box component="main" pos="relative">
      <VirtualMapViewer />
      <Anchor
        component={Link}
        to="/admin"
        pos="absolute"
        top="1rem"
        right="1rem"
        fw={600}
        style={{ zIndex: 2 }}
      >
        {messages.virtualMap.home.adminLink}
      </Anchor>
    </Box>
  );
}
