import BlockDisplayHeader from "@/components/content-input/content-blocks/BlockDisplayHeader.tsx";
import type {ContentPageBlockMetadata, ContentPageBlockValue} from "@/types/content-page.ts";
import {useCallback, useEffect, useState} from "react";
import {getBlockContent} from "@/services/content-page-service.ts";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import BlockDisplayBody from "@/components/content-input/content-blocks/rtf-block/BlockDisplayBody.tsx";
import {Box} from "@mantine/core";

type RtfBlockProps = {
  metadata: ContentPageBlockMetadata
}

export default function BlockDisplay({ metadata }: RtfBlockProps) {
  const [blockData, setBlockData] = useState<ContentPageBlockValue>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchBlockContent = useCallback(async () => {
    if (!metadata.id) return;
    setIsLoading(false)

    try {
      setBlockData(
        await getBlockContent(metadata.id, metadata.collectionName as ContentPageBlockType)
      )
    } finally {
      setIsLoading(false)
    }
  }, [metadata.id, metadata.collectionName])

  useEffect(() => {
    void fetchBlockContent()
  }, [fetchBlockContent])

  return (
    <Box mb="xl">
      <BlockDisplayHeader metadata={metadata} />
      <BlockDisplayBody isLoading={isLoading} content={blockData} />
    </Box>
  )
}