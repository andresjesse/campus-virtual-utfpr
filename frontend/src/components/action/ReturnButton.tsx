import {Button} from "@mantine/core";
import {CaretDoubleLeftIcon} from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import {useNavigate} from "react-router";
import messages from "@/constants/messages.json";

type ReturnButtonProps = {
  navRoute: string;
}

export default function ReturnButton({ navRoute }: ReturnButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      size="xs"
      variant="subtle"
      color="gray"
      leftSection={<CaretDoubleLeftIcon aria-hidden size={17} />}
      onClick={() => navigate(navRoute)}
      mb="lg"
      style={{ alignSelf: "flex-start" }}
    >
      {messages.common.back}
    </Button>
  );
}