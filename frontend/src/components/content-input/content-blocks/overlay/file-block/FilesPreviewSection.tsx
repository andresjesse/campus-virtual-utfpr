import { Flex, Image } from "@mantine/core";
import {branding} from "@/config/branding.ts";

type FilesPreviewProps = {
  content?: string | string[];
}

export default function FilesPreviewSection({ content }: FilesPreviewProps) {
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
          <Image
            src={fileUrl}
            key={fileUrl}
            h={120}
            w={120}
            radius="sm"
            fit="contain"
            bd={`1px solid ${branding.colors.text.muted}`}
          />
        ))}
      </Flex>
    </section>
  );
}