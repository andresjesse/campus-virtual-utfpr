import {Loader, Stack} from "@mantine/core";
import type {BlockDisplayBodyProps} from "@/components/content-input/content-blocks/registry.ts";
import FilesPreviewSection from "@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx";
import VideoPlayer from "@/components/content-input/content-blocks/file-block/VideoPlayer.tsx";
import {isVideoUrl} from "@/helpers/file-helper.ts";

export default function FileBlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  const urls = typeof content === "object" ? content.urls : [];

  if (isLoading) {
    return <Loader />;
  }

  const videoUrls = urls.filter(isVideoUrl);
  const otherUrls = urls.filter((url) => !isVideoUrl(url));

  return (
    <Stack gap="md">
      {videoUrls.map((url) => (
        <VideoPlayer key={url} src={url} />
      ))}
      {otherUrls.length > 0 && <FilesPreviewSection content={otherUrls} interactive={false} />}
    </Stack>
  );
}
