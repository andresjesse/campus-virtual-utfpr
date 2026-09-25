import { ScrollArea, Table } from "@mantine/core";
import { useNavigate } from "react-router";

import MeshTableRow from "@/components/mesh/mesh-table/MeshTableRow.tsx";
import messages from "@/constants/messages.json";
import type { MeshRecord } from "@/types/mesh.ts";

import classes from "@/components/content-page/page-table/page-table.module.css";

type MeshTableProps = {
  meshes: MeshRecord[];
};

export default function MeshTable({ meshes }: MeshTableProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className={classes.container}>
      <Table verticalSpacing={8} horizontalSpacing="md" miw={620}>
        <colgroup>
          <col style={{ width: "27%" }} />
          <col style={{ width: "40%" }} />
          <col style={{ width: "16.5%" }} />
          <col style={{ width: "16.5%" }} />
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{messages.mesh.list.tableName}</Table.Th>
            <Table.Th>{messages.mesh.list.tableDescription}</Table.Th>
            <Table.Th>{messages.common.createdAt}</Table.Th>
            <Table.Th>{messages.common.updatedAt}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {meshes.map((mesh) => (
            <MeshTableRow
              key={mesh.id}
              mesh={mesh}
              onOpen={() => navigate(`/admin/meshes/${mesh.id}`)}
            />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}