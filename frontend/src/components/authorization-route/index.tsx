import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";

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
        title: "Acesso restrito",
        message: "Você não tem permissão para acessar esta área.",
      });
    }
  }, [isAllowed]);

  return isAllowed ? <Outlet /> : <Navigate to="/admin/pages" replace />;
}
