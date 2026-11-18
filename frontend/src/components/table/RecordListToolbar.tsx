import { ActionIcon, Button, Flex } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import PageSearch from "@/components/content-page/page-search";

type RecordListToolbarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  newLabel: string;
  onNew: () => void;
};

export default function RecordListToolbar({
  searchLabel,
  searchPlaceholder,
  query,
  onQueryChange,
  newLabel,
  onNew,
}: RecordListToolbarProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      gap={{ base: "sm", sm: "xl" }}
      mt="auto"
      mb="lg"
      px={{ base: 0, sm: "lg" }}
    >
      <Flex flex={1} miw={0}>
        <PageSearch
          ariaLabel={searchLabel}
          placeholder={searchPlaceholder}
          value={query}
          onChange={onQueryChange}
        />
      </Flex>
      <ActionIcon
        hiddenFrom="xs"
        variant="outline"
        color="brand"
        size="2.4rem"
        flex="0 0 auto"
        aria-label={newLabel}
        onClick={onNew}
      >
        <PlusIcon aria-hidden size={18} />
      </ActionIcon>
      <Button
        visibleFrom="xs"
        variant="outline"
        color="brand"
        size="sm"
        flex="0 0 auto"
        leftSection={<PlusIcon aria-hidden size={16} />}
        onClick={onNew}
      >
        {newLabel}
      </Button>
    </Flex>
  );
}
