import {pocketbase} from "@/services/pocketbase.ts";
import type {DiagramBlockValue, FileBlockValue, RtfBlockValue} from "@/types/content-page.ts";

const RTF_BLOCK_COLLECTION = "rtf_block";
const DIAGRAM_BLOCK_COLLECTION = "diagram_block";
const FILE_BLOCK_COLLECTION = "file_block";

export async function getContentPageBlocks(pageId: string) {
  const [rtf_blocks, file_blocks, diagram_blocks] = await Promise.all([
    getRtfBlocks(pageId),
    getDiagramBlocks(pageId),
    getFileBlocks(pageId),
  ])

  return { rtfBlocks: rtf_blocks, diagramBlocks: diagram_blocks, fileBlocks: file_blocks }
}

async function getRtfBlocks(pageId: string) : Promise<RtfBlockValue[]> {
  return await pocketbase
    .collection(RTF_BLOCK_COLLECTION).getFullList<RtfBlockValue>({
      filter: `page="${pageId}"`,
      fields: "title, content",
      requestKey: null
    })
}

async function getDiagramBlocks(pageId: string) : Promise<DiagramBlockValue[]> {
  return await pocketbase
    .collection(DIAGRAM_BLOCK_COLLECTION).getFullList<DiagramBlockValue>({
      filter: `page="${pageId}"`,
      fields: "title, content",
      requestKey: null
    })
}

async function getFileBlocks(pageId: string) : Promise<FileBlockValue[]> {
  return await pocketbase
    .collection(FILE_BLOCK_COLLECTION).getFullList<FileBlockValue>({
      filter: `page="${pageId}"`,
      fields: "title, content",
      requestKey: null
    })
}