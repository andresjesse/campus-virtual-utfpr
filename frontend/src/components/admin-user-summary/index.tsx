import { Avatar, Group, Stack, Text, UnstyledButton } from "@mantine/core";

import { useAuthentication } from "@/hooks/use-authentication";
import { pocketbase } from "@/services/pocketbase";

import classes from "./admin-user-summary.module.css";

type AdminUserSummaryProps = {
  collapsed?: boolean;
};

function getDisplayName(name?: string, surname?: string) {
  return [name, surname].filter(Boolean).join(" ") || "Editor";
}

export default function AdminUserSummary({
  collapsed = false,
}: AdminUserSummaryProps) {
  const { logout, user } = useAuthentication();
  const avatarUrl =
    user?.avatar && user.collectionId
      ? pocketbase.files.getURL(user, user.avatar, { thumb: "80x80" })
      : undefined;

  return (
    <UnstyledButton
      className={`${classes.user} ${collapsed ? classes.collapsed : ""}`}
      onClick={logout}
      aria-label="Sair da conta"
      title="Sair da conta"
    >
      <Group wrap="nowrap" gap={0}>
        <span className={classes.avatarSlot}>
          <Avatar
            size="sm"
            src={avatarUrl}
            name={getDisplayName(user?.name, user?.surname)}
          />
        </span>
        <Stack gap={1} className={classes.details}>
          <Text fw={600} size="sm">{getDisplayName(user?.name, user?.surname)}</Text>
          <Text c="dimmed" size="xs" truncate>
            {user?.email}
          </Text>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}
