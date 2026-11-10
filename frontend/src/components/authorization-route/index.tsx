import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

import messages from "@/constants/messages.json";
import {
  canAccessAdminCapability,
  type AdminCapability,
} from "@/helpers/authorization/admin-permissions";
import { useAuthentication } from "@/hooks/use-authentication";

type AuthorizationRouteProps = {
  capability: AdminCapability;
};

export default function AuthorizationRoute({
  capability,
}: AuthorizationRouteProps) {
  const { user } = useAuthentication();
  const isAllowed = canAccessAdminCapability(user, capability);

  useEffect(() => {
    if (!isAllowed) {
      notifications.show({
        color: "red",
        title: messages.authentication.route.restrictedTitle,
        message: messages.authentication.route.restrictedMessage,
      });
    }
  }, [isAllowed]);

  return isAllowed ? <Outlet /> : <Navigate to="/admin/pages" replace />;
}
