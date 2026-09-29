import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import MeshTableRow from "@/components/mesh/mesh-table/MeshTableRow.tsx";
import messages from "@/constants/messages.json";
import type { MeshRecord } from "@/types/mesh.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MeshTableProps = {
  deletingMeshId: string | null;
  meshes: MeshRecord[];
  onDelete: (mesh: MeshRecord) => void;
};

export default function MeshTable({
  deletingMeshId,
  meshes,
  onDelete,
}: MeshTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className={classes.container}>
      <Table verticalSpacing={8} horizontalSpacing="md" miw={620}>
        <colgroup>
          <col style={{ width: "25%" }} />
          <col style={{ width: "37%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "6%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.mesh.list.tableName}</Table.Th>
            <Table.Th>{messages.mesh.list.tableDescription}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
            <Table.Th aria-label={messages.common.actions} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {meshes.map((mesh) => (
            <MeshTableRow
              key={mesh.id}
              mesh={mesh}
              deleting={deletingMeshId === mesh.id}
              onDelete={() => onDelete(mesh)}
              onOpen={() => navigate(`/admin/meshes/${mesh.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}