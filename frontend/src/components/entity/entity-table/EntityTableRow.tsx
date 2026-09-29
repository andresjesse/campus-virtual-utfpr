import { Table } from "@mantine/core";

import TableDeleteActionCell from "@/components/table/TableDeleteActionCell.tsx";
import messages from "@/constants/messages.json";
import { formatDate } from "@/helpers/conversion-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { EntityRecord } from "@/types/entity.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type EntityTableRowProps = {
  deleting: boolean;
  entity: EntityRecord;
  onDelete: () => void;
  onOpen: () => void;
};

export default function EntityTableRow({
  deleting,
  entity,
  onDelete,
  onOpen,
}: EntityTableRowProps) {
  const name = entity.slug || messages.entities.list.noIdentifier;
  const activeLabel = entity.is_active
    ? messages.entities.list.activeYes
    : messages.entities.list.activeNo;

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
      aria-label={formatMessage(messages.entities.list.editAriaLabel, name)}
    >
      <Table.Td>{entity.slug || messages.common.emptyValue}</Table.Td>
      <Table.Td>{entity.expand?.mesh?.name || messages.entities.list.noMesh}</Table.Td>
      <Table.Td>{activeLabel}</Table.Td>
      <Table.Td>{formatDate(entity.created)}</Table.Td>
      <Table.Td>{formatDate(entity.updated)}</Table.Td>
      <TableDeleteActionCell
        ariaLabel={formatMessage(messages.entities.list.deleteAriaLabel, name)}
        deleting={deleting}
        onDelete={onDelete}
      />
    </Table.Tr>
  );
}
