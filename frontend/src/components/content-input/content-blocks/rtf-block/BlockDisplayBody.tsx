import type {ContentPageBlockValue} from "@/types/content-page.ts";
import FeedbackState from "@/components/feedback-state";
import {Box, Typography} from "@mantine/core";
import sanitizeRichText from "@/helpers/sanitize-rich-text.ts";
import {useMemo} from "react";

type BlockDisplayBodyProps = {
  isLoading: boolean;
  content?: ContentPageBlockValue
}

export default function BlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  const richTextContent = typeof content === "string"
    ? content
    : "<p>Conteúdo provisório</p>";

  const sanitizedContent = useMemo(
    () => sanitizeRichText(richTextContent),
    [richTextContent],
  );

  if (isLoading) {
    return <FeedbackState title="Carregando conteúdo..." />
  }

  return (
    <Box bd="2px solid white" bdrs="4px">
      <Typography px="md" py="xs">
        <Box
          style={{ wordBreak: "break-all" }}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}>
        </Box>
      </Typography>
    </Box>
  );
}
