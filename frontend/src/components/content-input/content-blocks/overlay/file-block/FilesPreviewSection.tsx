import { Flex, Image } from "@mantine/core";
import {branding} from "@/config/branding.ts";

type FilesPreviewProps = {
  content: string[];
}

export default function FilesPreviewSection({ content }: FilesPreviewProps) {
  return (
    <section>
      <Flex
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        gap={16}
      >
        { content.map((fileUrl) => (
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