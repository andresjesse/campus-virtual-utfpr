import { TextInput } from "@mantine/core";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import classes from "./page-search.module.css";

type PageSearchProps = {
  onChange: (value: string) => void;
  value: string;
};

export default function PageSearch({ onChange, value }: PageSearchProps) {
  return (
    <TextInput
      aria-label="Pesquisar páginas pelo nome"
      placeholder="Pesquise pelo nome"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      leftSection={<MagnifyingGlassIcon aria-hidden size={20} />}
      classNames={{ input: classes.input }}
    />
  );
}
