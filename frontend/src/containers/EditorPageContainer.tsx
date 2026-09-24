import {Flex} from "@mantine/core";
import type {ReactNode} from "react";

import ReturnButton from "@/components/action/ReturnButton.tsx";
import RoundedPaperContainer from "@/containers/RoundedPaperContainer.tsx";

type EditorPageContainerProps = {
  navRoute: string;
  ariaLabel: string;
  children: ReactNode;
}

export default function EditorPageContainer({ navRoute, ariaLabel, children }: EditorPageContainerProps) {
  return (
    <Flex
      component="section"
      direction="column"
      flex="1 1 auto"
      miw={0}
      mih="calc(100dvh - 60px)"
      px={{ base: "0.75rem", md: "md" }}
      pt="sm"
      pb={{ base: "0.75rem", md: 0 }}
    >
      <ReturnButton navRoute={navRoute} />

      <RoundedPaperContainer
        ariaLabel={ariaLabel}
        mih={{ base: "calc(100dvh - 6.5rem)", md: 0 }}
        style={{ overflow: "hidden" }}
      >
        {children}
      </RoundedPaperContainer>
    </Flex>
  );
}
