import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import MenuItemTableRow from "@/components/menu/menu-item-table/MenuItemTableRow.tsx";
import messages from "@/constants/messages.json";
import type { MenuItemRecord } from "@/types/menu.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MenuItemTableProps = {
  items: MenuItemRecord[];
  deletingItemId: string | null;
  onDelete: (item: MenuItemRecord) => void;
};

export default function MenuItemTable({
  items,
  deletingItemId,
  onDelete,
}: MenuItemTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea
      className={classes.container}
      style={{ borderStartStartRadius: 0, borderStartEndRadius: 0 }}
    >
      <Table verticalSpacing={8} horizontalSpacing="md" miw={820}>
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.menuItems.list.tableLabel}</Table.Th>
            <Table.Th>{messages.menuItems.list.tableCategory}</Table.Th>
            <Table.Th>{messages.menuItems.list.tableRelatedType}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
            <Table.Th>{messages.menuItems.list.tableIcon}</Table.Th>
            <Table.Th aria-label={messages.common.actions} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <MenuItemTableRow
              key={item.id}
              item={item}
              deleting={deletingItemId === item.id}
              onDelete={() => onDelete(item)}
              onOpen={() => navigate(`/admin/menu/items/${item.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
