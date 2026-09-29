import { TextInput } from "@mantine/core";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import classes from "./page-search.module.css";

type PageSearchProps = {
  ariaLabel?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export default function PageSearch({
  ariaLabel = "Pesquisar páginas pelo nome",
  onChange,
  placeholder = "Pesquise pelo nome",
  value,
}: PageSearchProps) {
  return (
    <TextInput
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      leftSection={<MagnifyingGlassIcon aria-hidden size={20} />}
      classNames={{ input: classes.input }}
      w="min(30rem, 60%)"
    />
  );
}
