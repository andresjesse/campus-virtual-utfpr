import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import MenuCategoryTableRow from "@/components/menu/menu-category-table/MenuCategoryTableRow.tsx";
import messages from "@/constants/messages.json";
import type { MenuCategoryRecord } from "@/types/menu.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MenuCategoryTableProps = {
  categories: MenuCategoryRecord[];
  deletingCategoryId: string | null;
  onDelete: (category: MenuCategoryRecord) => void;
};

export default function MenuCategoryTable({
  categories,
  deletingCategoryId,
  onDelete,
}: MenuCategoryTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea
      className={classes.container}
      style={{ borderStartStartRadius: 0, borderStartEndRadius: 0 }}
    >
      <Table verticalSpacing={8} horizontalSpacing="md" miw={620}>
        <colgroup>
          <col style={{ width: "56%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.menuCategories.list.tableLabel}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
            <Table.Th aria-label={messages.common.actions} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {categories.map((category) => (
            <MenuCategoryTableRow
              key={category.id}
              category={category}
              deleting={deletingCategoryId === category.id}
              onDelete={() => onDelete(category)}
              onOpen={() => navigate(`/admin/menu/categories/${category.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
