import { Image, Table } from "@mantine/core";

import TableDeleteActionCell from "@/components/table/TableDeleteActionCell.tsx";
import messages from "@/constants/messages.json";
import { formatDate } from "@/helpers/conversion-helper.ts";
import { getMenuItemCategoryName } from "@/helpers/menu-item-service-helper.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { getMenuItemIconUrl } from "@/services/menu-item-service.ts";
import type { MenuItemRecord } from "@/types/menu.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MenuItemTableRowProps = {
  item: MenuItemRecord;
  deleting: boolean;
  onDelete: () => void;
  onOpen: () => void;
};

export default function MenuItemTableRow({
  item,
  deleting,
  onDelete,
  onOpen,
}: MenuItemTableRowProps) {
  const name = item.label || messages.menuItems.list.noIdentifier;
  const iconUrl = getMenuItemIconUrl(item);
  const categoryName = getMenuItemCategoryName(item);
  const relatedType = item.page
    ? messages.menuItems.list.relatedPage
    : item.href
      ? messages.menuItems.list.relatedLink
      : messages.common.emptyValue;

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
      aria-label={formatMessage(messages.menuItems.list.editAriaLabel, name)}
    >
      <Table.Td>{item.label || messages.common.emptyValue}</Table.Td>
      <Table.Td>{categoryName || messages.common.emptyValue}</Table.Td>
      <Table.Td>{relatedType}</Table.Td>
      <Table.Td>{formatDate(item.created)}</Table.Td>
      <Table.Td>{formatDate(item.updated)}</Table.Td>
      <Table.Td>
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={formatMessage(messages.menuItems.list.iconAlt, name)}
            w={28}
            h={28}
            fit="contain"
          />
        ) : (
          messages.common.emptyValue
        )}
      </Table.Td>
      <TableDeleteActionCell
        ariaLabel={formatMessage(messages.menuItems.list.deleteAriaLabel, name)}
        deleting={deleting}
        onDelete={onDelete}
      />
    </Table.Tr>
  );
}
