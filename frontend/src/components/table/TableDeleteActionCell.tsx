import { ActionIcon, Table } from "@mantine/core";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

type TableDeleteActionCellProps = {
  ariaLabel: string;
  deleting: boolean;
  onDelete: () => void;
};

export default function TableDeleteActionCell({
  ariaLabel,
  deleting,
  onDelete,
}: TableDeleteActionCellProps) {
  return (
    <Table.Td ta="right">
      <ActionIcon
        aria-label={ariaLabel}
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
  );
}
