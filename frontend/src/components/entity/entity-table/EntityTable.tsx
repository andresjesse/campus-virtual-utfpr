import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import EntityTableRow from "@/components/entity/entity-table/EntityTableRow.tsx";
import messages from "@/constants/messages.json";
import type { EntityRecord } from "@/types/entity.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type EntityTableProps = {
  deletingEntityId: string | null;
  entities: EntityRecord[];
  onDelete: (entity: EntityRecord) => void;
};

export default function EntityTable({
  deletingEntityId,
  entities,
  onDelete,
}: EntityTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className={classes.container}>
      <Table verticalSpacing={8} horizontalSpacing="md" miw={720}>
        <colgroup>
          <col style={{ width: "22%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.entities.list.tableSlug}</Table.Th>
            <Table.Th>{messages.entities.list.tableMesh}</Table.Th>
            <Table.Th>{messages.entities.list.tableActive}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
            <Table.Th aria-label={messages.common.actions} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {entities.map((entity) => (
            <EntityTableRow
              key={entity.id}
              entity={entity}
              deleting={deletingEntityId === entity.id}
              onDelete={() => onDelete(entity)}
              onOpen={() => navigate(`/admin/entities/${entity.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
