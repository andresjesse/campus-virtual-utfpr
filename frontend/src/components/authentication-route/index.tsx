import { Center, Loader } from "@mantine/core";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuthentication } from "@/hooks/use-authentication";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

function AuthenticationLoader() {
  return (
    <Center mih="100dvh">
      <Loader aria-label="Verificando autenticação" color="yellow" />
    </Center>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthentication();
  const location = useLocation();

  if (isInitializing) {
    return <AuthenticationLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuthentication();
  const location = useLocation();

  if (isInitializing) {
    return <AuthenticationLoader />;
  }

  if (isAuthenticated) {
    const state = location.state as LoginLocationState | null;
    const destination = state?.from?.pathname || "/admin";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
