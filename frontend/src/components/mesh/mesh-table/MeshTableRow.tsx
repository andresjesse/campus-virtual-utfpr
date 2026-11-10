import { Table } from "@mantine/core";

import TableDeleteActionCell from "@/components/table/TableDeleteActionCell.tsx";
import messages from "@/constants/messages.json";
import { formatDate } from "@/helpers/conversion-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { MeshRecord } from "@/types/mesh.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MeshTableRowProps = {
  deleting: boolean;
  mesh: MeshRecord;
  onDelete: () => void;
  onOpen: () => void;
};

export default function MeshTableRow({
  deleting,
  mesh,
  onDelete,
  onOpen,
}: MeshTableRowProps) {
  const name = mesh.name || messages.mesh.list.noIdentifier;

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
      aria-label={formatMessage(messages.mesh.list.editAriaLabel, name)}
    >
      <Table.Td>{mesh.name || messages.common.emptyValue}</Table.Td>
      <Table.Td>{mesh.description || messages.common.emptyValue}</Table.Td>
      <Table.Td>{formatDate(mesh.created)}</Table.Td>
      <Table.Td>{formatDate(mesh.updated)}</Table.Td>
      <TableDeleteActionCell
        ariaLabel={formatMessage(messages.mesh.list.deleteAriaLabel, name)}
        deleting={deleting}
        onDelete={onDelete}
      />
    </Table.Tr>
  );
}
