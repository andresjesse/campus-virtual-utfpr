import {Center, Image} from "@mantine/core";
import VideoPlayer from "@/components/content-input/content-blocks/file-block/VideoPlayer.tsx";
import {branding} from "@/config/branding.ts";
import {FILE_CAROUSEL_ASPECT_RATIO, FILE_CAROUSEL_MAX_HEIGHT} from "@/constants/content-constants.ts";
import {getFilenameFromUrl, isVideoUrl} from "@/helpers/file-helper.ts";

type FileBlockSlideProps = {
  src: string;
}

export default function FileBlockSlide({ src }: FileBlockSlideProps) {
  return (
    <Center w="100%" mah={FILE_CAROUSEL_MAX_HEIGHT} bg={branding.colors.surface.media} style={{ aspectRatio: FILE_CAROUSEL_ASPECT_RATIO }}>
      {isVideoUrl(src) ? (
        <VideoPlayer src={src} />
      ) : (
        <Image
          src={src}
          alt={getFilenameFromUrl(src)}
          w="100%"
          h="100%"
          fit="contain"
          draggable={false}
        />
      )}
    </Center>
  );
}
