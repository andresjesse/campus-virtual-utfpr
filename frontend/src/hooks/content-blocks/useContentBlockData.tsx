import {useCallback, useEffect, useState} from "react";
import type {ContentPageBlockMetadata, ContentPageBlockValue} from "@/types/content-page.ts";
import {getBlockContent, upsertBlockContent as upsertBlockContentApi} from "@/services/content-page-service.ts";
import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";

export default function useContentBlockData(metadata: ContentPageBlockMetadata) {
  const [blockData, setBlockData] = useState<ContentPageBlockValue>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchBlockContent = useCallback(async () => {
    if (!metadata?.id) return;
    setIsLoading(true)

    try {
      setBlockData(
        await getBlockContent(metadata.id, metadata.collectionName as ContentPageBlockType)
      )
    } finally {
      setIsLoading(false)
    }
  }, [metadata?.collectionName, metadata?.id])

  const upsertBlockContent = async (newContent: ContentPageBlockValue) => {
    setIsLoading(true)

    try {
      await upsertBlockContentApi(
        { ...metadata, title: metadata.title.trim(), content: newContent },
      )

      if (metadata.collectionName === ContentPageBlocksEnum.FILE_BLOCK) {
        await fetchBlockContent()
      } else {
        setBlockData(newContent)
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchBlockContent()
  }, [fetchBlockContent])

  return { blockData, isLoading, fetchBlockContent, upsertBlockContent }
}
