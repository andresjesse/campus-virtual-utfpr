import {Carousel} from "@mantine/carousel";
import {Box} from "@mantine/core";
import {useRef} from "react";
import FileBlockSlide from "@/components/content-input/content-blocks/file-block/FileBlockSlide.tsx";
import {formatMessage} from "@/helpers/message-helper.ts";
import messages from "@/constants/messages.json";

type FileBlockCarouselProps = {
  urls: string[];
}

export default function FileBlockCarousel({ urls }: FileBlockCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (urls.length === 1) {
    return <FileBlockSlide src={urls[0]} />;
  }

  const pauseVideos = () => {
    containerRef.current?.querySelectorAll("video").forEach((video) => video.pause());
  };

  return (
    <Box ref={containerRef}>
      <Carousel
        withIndicators
        onSlideChange={pauseVideos}
        controlsOffset="xs"
        styles={{
          root: { paddingBottom: "1.75rem" },
          controls: { top: "auto", bottom: 0, height: "1.75rem" },
          indicators: { bottom: 0, height: "1.75rem", alignItems: "center" },
        }}
        previousControlProps={{ "aria-label": messages.files.carousel.previous }}
        nextControlProps={{ "aria-label": messages.files.carousel.next }}
        getIndicatorProps={(index) => ({
          "aria-label": formatMessage(messages.files.carousel.indicator, String(index + 1)),
        })}
      >
        {urls.map((url) => (
          <Carousel.Slide key={url}>
            <FileBlockSlide src={url} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}
