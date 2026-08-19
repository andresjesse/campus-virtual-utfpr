import { Button, Center, Loader, Stack, Text, Title } from "@mantine/core";

type FeedbackStateProps = {
  actionLabel?: string;
  description?: string;
  loading?: boolean;
  onAction?: () => void;
  title: string;
};

export default function FeedbackState({
  actionLabel,
  description,
  loading = false,
  onAction,
  title,
}: FeedbackStateProps) {
  return (
    <Center mih={240} role={loading ? "status" : undefined}>
      <Stack align="center" gap="xs" ta="center">
        {loading && <Loader size="sm" aria-label={title} />}
        {!loading && <Title order={4}>{title}</Title>}
        {description && <Text size="sm" c="dimmed">{description}</Text>}
        {actionLabel && onAction && (
          <Button size="xs" color="brand" variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );
}
