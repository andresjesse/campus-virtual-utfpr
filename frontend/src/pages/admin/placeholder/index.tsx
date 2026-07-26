import { Center, Stack, Text, Title } from "@mantine/core";

type AdminPlaceholderProps = {
  title: string;
};

export default function AdminPlaceholder({ title }: AdminPlaceholderProps) {
  return (
    <Center mih="calc(100dvh - 60px)">
      <Stack align="center" gap="xs">
        <Title order={2} fz="xl">{title}</Title>
        <Text size="sm" c="dimmed">Esta área será implementada em uma próxima tarefa.</Text>
      </Stack>
    </Center>
  );
}
