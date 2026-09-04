import FeedbackState from "@/components/feedback-state";
import {Box, Typography} from "@mantine/core";
import sanitizeRichText from "@/helpers/sanitize-rich-text.ts";
import {useMemo} from "react";
import type {BlockDisplayBodyProps} from "@/components/content-input/content-blocks/registry.ts";

export default function RtfBlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
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
