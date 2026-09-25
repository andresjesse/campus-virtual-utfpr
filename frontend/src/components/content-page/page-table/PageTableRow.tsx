import { ActionIcon, Table } from "@mantine/core";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import messages from "@/constants/messages.json";
import { formatDate } from "@/helpers/conversion-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { ContentPageListRecord } from "@/types/content-page.ts";

import classes from "./page-table.module.css";

type PageTableRowProps = {
  deleting: boolean;
  onDelete: () => void;
  onOpen: () => void;
  page: ContentPageListRecord;
};

export default function PageTableRow({
  deleting,
  onDelete,
  onOpen,
  page,
}: PageTableRowProps) {
  const title = page.title || messages.contentPages.list.untitled;

  return (
    <Table.Tr
      tabIndex={0}
      className={classes.row}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={formatMessage(messages.contentPages.list.editAriaLabel, title)}
    >
      <Table.Td>{title}</Table.Td>
      <Table.Td>{formatDate(page.created)}</Table.Td>
      <Table.Td>{formatDate(page.updated)}</Table.Td>
      <Table.Td>
        {page.relatedType === "entity"
          ? messages.contentPages.list.relatedEntity
          : page.relatedType === "menu_item"
            ? messages.contentPages.list.relatedMenuItem
            : messages.common.emptyValue}
      </Table.Td>
      <Table.Td ta="right">
        <ActionIcon
          aria-label={formatMessage(messages.contentPages.list.deleteAriaLabel, title)}
          color="red"
          variant="subtle"
          size="sm"
          loading={deleting}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TrashIcon aria-hidden size={15} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}
