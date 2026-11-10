import { Table } from "@mantine/core";

import TableDeleteActionCell from "@/components/table/TableDeleteActionCell.tsx";
import messages from "@/constants/messages.json";
import { formatDate } from "@/helpers/conversion-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import type { MenuCategoryRecord } from "@/types/menu.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MenuCategoryTableRowProps = {
  category: MenuCategoryRecord;
  deleting: boolean;
  onDelete: () => void;
  onOpen: () => void;
};

export default function MenuCategoryTableRow({
  category,
  deleting,
  onDelete,
  onOpen,
}: MenuCategoryTableRowProps) {
  const name = category.label || messages.menuCategories.list.noIdentifier;

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
      aria-label={formatMessage(messages.menuCategories.list.editAriaLabel, name)}
    >
      <Table.Td>{category.label || messages.common.emptyValue}</Table.Td>
      <Table.Td>{formatDate(category.created)}</Table.Td>
      <Table.Td>{formatDate(category.updated)}</Table.Td>
      <TableDeleteActionCell
        ariaLabel={formatMessage(messages.menuCategories.list.deleteAriaLabel, name)}
        deleting={deleting}
        onDelete={onDelete}
      />
    </Table.Tr>
  );
}
