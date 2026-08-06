import type {ContentPageBlockValue} from "@/types/content-page.ts";
import FeedbackState from "@/components/feedback-state";
import {Box, Typography} from "@mantine/core";

type BlockDisplayBodyProps = {
  isLoading: boolean;
  content?: ContentPageBlockValue
}

export default function BlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  if (isLoading) {
    return <FeedbackState title="Carregando conteúdo..." />
  }

  return (
    <Box bd="2px solid white" bdrs="4px">
      <Typography px="md" py="xs">
        <Box
          style={{ wordBreak: "break-all" }}
          dangerouslySetInnerHTML={{ __html: content ?? '<p>Conteúdo provisório</p>' }}>
        </Box>
      </Typography>
    </Box>
  );
}