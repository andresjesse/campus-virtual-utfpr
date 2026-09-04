import {Button, Flex} from "@mantine/core";
import {CaretDownIcon} from "@phosphor-icons/react";
import {useElementSize} from "@mantine/hooks";
import {useState} from "react";
import PreviewImageCard from "@/components/content-input/content-blocks/overlay/file-block/PreviewImageCard.tsx";
import {FILE_PREVIEW_CARD_SIZE, FILE_PREVIEW_GAP} from "@/constants/content-constants.ts";
import messages from "@/constants/messages.json";

type FilesPreviewProps = {
  content?: string | string[];
  markedUrls?: string[];
  onToggleDelete?: (url: string) => void;
  maxVisibleRows?: number;
  interactive: boolean;
}

export default function FilesPreviewSection({
  content,
  markedUrls = [],
  onToggleDelete,
  maxVisibleRows = 2,
  interactive
}: FilesPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const { ref, width } = useElementSize();

  const filteredContent = (Array.isArray(content) ? content : [content])
    .filter((fileUrl): fileUrl is string => !!fileUrl && fileUrl.trim().length > 0);

  const itemsPerRow = Math.max(1, Math.floor((width + FILE_PREVIEW_GAP) / (FILE_PREVIEW_CARD_SIZE + FILE_PREVIEW_GAP)));
  const maxVisible = itemsPerRow * maxVisibleRows;
  const canCollapse = filteredContent.length > maxVisible;
  const visibleContent = canCollapse && !expanded ? filteredContent.slice(0, maxVisible) : filteredContent;

  return (
    <section>
      <Flex
        ref={ref}
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        gap={FILE_PREVIEW_GAP}
      >
        {visibleContent.map((fileUrl) => (
          <PreviewImageCard
            key={fileUrl}
            src={fileUrl}
            marked={markedUrls.includes(fileUrl)}
            onToggle={onToggleDelete ?? (() => undefined)}
            interactive={interactive}
          />
        ))}
      </Flex>

      {canCollapse && (
        <Button
          variant="subtle"
          size="xs"
          mt="xs"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          rightSection={
            <CaretDownIcon
              aria-hidden
              size={14}
              style={{
                transform: expanded ? 'rotate(180deg)' : undefined,
                transition: 'transform 150ms ease',
              }}
            />
          }
        >
          {expanded ? messages.files.preview.showLess : messages.files.preview.showMore}
        </Button>
      )}
    </section>
  );
}