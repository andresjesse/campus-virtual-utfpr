import { Flex } from "@mantine/core";
import PreviewImageCard from "@/components/content-input/content-blocks/overlay/file-block/PreviewImageCard.tsx";

type FilesPreviewProps = {
  content?: string | string[];
  markedUrls?: string[];
  onToggleDelete?: (url: string) => void;
}

export default function FilesPreviewSection({ content, markedUrls = [], onToggleDelete }: FilesPreviewProps) {
  const displayableContent = Array.isArray(content) ? content : [content];

  const filteredContent = displayableContent
    .filter((fileUrl): fileUrl is string => !!fileUrl && fileUrl.trim().length > 0);

  return (
    <section>
      <Flex
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        gap={16}
      >
        {filteredContent.map((fileUrl) => (
          <PreviewImageCard
            key={fileUrl}
            src={fileUrl}
            marked={markedUrls.includes(fileUrl)}
            onToggle={onToggleDelete ?? (() => undefined)}
          />
        ))}
      </Flex>
    </section>
  );
}