import { ActionIcon, ScrollArea, Table } from "@mantine/core";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useNavigate } from "react-router";

import type { ContentPageListRecord } from "@/types/content-page";

import classes from "./page-table.module.css";

type PageTableProps = {
  deletingPageId: string | null;
  onDelete: (page: ContentPageListRecord) => void;
  pages: ContentPageListRecord[];
};

type PageTableRowProps = {
  deleting: boolean;
  onDelete: () => void;
  onOpen: () => void;
  page: ContentPageListRecord;
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

function PageTableRow({ deleting, onDelete, onOpen, page }: PageTableRowProps) {
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
      aria-label={`Editar página ${page.title || "Sem título"}`}
    >
      <Table.Td>{page.title || "Sem título"}</Table.Td>
      <Table.Td>{formatDate(page.created)}</Table.Td>
      <Table.Td>{formatDate(page.updated)}</Table.Td>
      <Table.Td>
        {page.relatedType === "entity"
          ? "Modelo 3D"
          : page.relatedType === "menu_item"
            ? "Item de Menu"
            : "—"}
      </Table.Td>
      <Table.Td ta="right">
        <ActionIcon
          aria-label={`Excluir página ${page.title || "Sem título"}`}
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
            <Table.Th>Nome</Table.Th>
            <Table.Th>Criado em</Table.Th>
            <Table.Th>Modificado em</Table.Th>
            <Table.Th>Tipo relacionado</Table.Th>
            <Table.Th aria-label="Ações" />
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
