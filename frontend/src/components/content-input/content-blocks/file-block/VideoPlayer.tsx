import {getFilenameFromUrl} from "@/helpers/file-helper.ts";
import {formatMessage} from "@/helpers/message-helper.ts";
import messages from "@/constants/messages.json";

type VideoPlayerProps = {
  src: string;
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const ariaLabel = formatMessage(messages.files.video.ariaLabel, getFilenameFromUrl(src));

  return (
    <video
      controls
      preload="metadata"
      src={src}
      aria-label={ariaLabel}
      style={{ display: "block", width: "100%", height: "auto", maxHeight: "70vh" }}
    >
      {messages.files.video.unsupported}
    </video>
  );
}
