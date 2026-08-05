import type {
  GroupedContentPageBlockMetadata
} from "@/types/content-page.ts";
import BlockDisplay from "@/components/content-input/content-blocks/BlockDisplay.tsx";
import classes from "@/components/content-page-form/content-page-form.module.css";
import {ContentPageBlocksEnum, type ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import DroppableContainer from "@/containers/DroppableContainer.tsx";
import {useCallback, useContext, useEffect, useState} from "react";
import {useParams} from "react-router";
import {getAllContentBlocksMetadata} from "@/helpers/content-pages-service-helper.ts";
import FeedbackState from "@/components/feedback-state";
import { Box } from "@mantine/core";
import {DialogContext} from "@/contexts/dialog-context.ts";
import {deleteBlockContent} from "@/services/content-page-service.ts";

export default function BlocksList() {
  const { pageId } = useParams();

  const [blocksMetadata, setBlocksMetadata] = useState<GroupedContentPageBlockMetadata>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const dialogBox = useContext(DialogContext);

  const fetchBlocksMetadata = useCallback(async () => {
    if (!pageId) return;

    setIsLoading(true);

    try {
      setBlocksMetadata(
        await getAllContentBlocksMetadata(pageId, false)
      );
    } catch(error) {
      console.log(error);
      setError("Houve um erro inesperado.")
    } finally {
      setIsLoading(false);
    }
  }, [pageId])

  useEffect(() => {
    void fetchBlocksMetadata();
  }, [fetchBlocksMetadata]);


  function onDropNewBlock(blockType: string) {
    const typedBlockType = blockType as ContentPageBlockType;
    const newBlocks: GroupedContentPageBlockMetadata = {
      ...blocksMetadata,
      [typedBlockType]: [
        ...(blocksMetadata?.[typedBlockType] ?? []),
        { title: "Título provisório", collectionName: ContentPageBlocksEnum.RTF_BLOCK }
      ]
    }
    setBlocksMetadata(newBlocks);
  }

  async function handleDelete(id: string, title: string, collectionName: string) {
    const hasConfirmed = await dialogBox!.confirm({
      title: "Excluir Bloco",
      firstMessage: `Deseja mesmo excluir o bloco ${title ?? "Sem título"}?`,
      secondMessage: "Esta ação não pode ser desfeita."
    })

    if (!hasConfirmed) return;

    try {
      await deleteBlockContent(id, collectionName as ContentPageBlockType)
    } finally {
      setBlocksMetadata((currentVal) => {
        return {
        ...currentVal,
          [collectionName as ContentPageBlockType]: currentVal?.[collectionName as ContentPageBlockType]
            ?.filter((el) => el.id !== id)
        }
      })
    }
  }

  if (isLoading) {
    return <FeedbackState title={"Carregando os blocos de conteúdo..."} loading />
  }

  if (error) {
    return <FeedbackState
      title={"Não foi possível carregar os blocos de conteúdo."}
      description={error}
      actionLabel={"Tentar novamente"}
      onAction={fetchBlocksMetadata}
    />
  }

  return (
    <DroppableContainer handleDrop={onDropNewBlock} >
      <Box className={classes.blocksList} pt="lg" ml="lg" mr="lg">
        { blocksMetadata?.rtf_block?.map((metadata) => (
          <BlockDisplay
            key={metadata.id}
            metadata={metadata}
            onDelete={() => handleDelete(metadata.id!, metadata.title, metadata.collectionName)}
          />
        )) }
      </Box>
    </DroppableContainer>
  )
}