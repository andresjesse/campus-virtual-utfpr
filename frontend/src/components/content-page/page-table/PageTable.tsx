import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import PageTableRow from "@/components/content-page/page-table/PageTableRow.tsx";
import messages from "@/constants/messages.json";
import type { ContentPageListRecord } from "@/types/content-page.ts";

import classes from "./page-table.module.css";

type PageTableProps = {
  deletingPageId: string | null;
  onDelete: (page: ContentPageListRecord) => void;
  pages: ContentPageListRecord[];
};

export default function PageTable({
  deletingPageId,
  onDelete,
  pages,
}: PageTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className={classes.container}>
      <Table verticalSpacing={8} horizontalSpacing="md" miw={620}>
        <colgroup>
          <col style={{ width: "27%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "25%" }} />
          <col style={{ width: "6%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.contentPages.list.tableTitle}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
            <Table.Th>{messages.contentPages.list.tableRelatedType}</Table.Th>
            <Table.Th aria-label={messages.common.actions} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pages.map((page) => (
            <PageTableRow
              key={page.id}
              page={page}
              deleting={deletingPageId === page.id}
              onDelete={() => onDelete(page)}
              onOpen={() => navigate(`/admin/pages/${page.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
