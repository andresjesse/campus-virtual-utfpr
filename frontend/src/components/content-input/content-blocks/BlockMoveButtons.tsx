import {ActionIcon, Flex} from "@mantine/core";
import {CaretUpIcon} from "@phosphor-icons/react/dist/csr/CaretUp";
import {CaretDownIcon} from "@phosphor-icons/react/dist/csr/CaretDown";
import messages from "@/constants/messages.json";
import {formatMessage} from "@/helpers/message-helper.ts";

type BlockMoveButtonsProps = {
  blockName: string
  canMoveUp: boolean
  canMoveDown: boolean
  disabled: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

export default function BlockMoveButtons({
  blockName,
  canMoveUp,
  canMoveDown,
  disabled,
  onMoveUp,
  onMoveDown,
}: BlockMoveButtonsProps) {
  return (
    <Flex align="center" gap={4}>
      <ActionIcon
        aria-label={formatMessage(messages.block.list.moveUpAriaLabel, blockName)}
        variant="subtle"
        size="md"
        disabled={disabled || !canMoveUp}
        onClick={(event) => {
          event.stopPropagation();
          onMoveUp();
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <CaretUpIcon aria-hidden size={18} />
      </ActionIcon>

      <ActionIcon
        aria-label={formatMessage(messages.block.list.moveDownAriaLabel, blockName)}
        variant="subtle"
        size="md"
        disabled={disabled || !canMoveDown}
        onClick={(event) => {
          event.stopPropagation();
          onMoveDown();
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <CaretDownIcon aria-hidden size={18} />
      </ActionIcon>
    </Flex>
  );
}
