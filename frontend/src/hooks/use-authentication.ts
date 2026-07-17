import { useContext } from "react";

import { AuthenticationContext } from "@/contexts/authentication-context";

export function useAuthentication() {
  const authentication = useContext(AuthenticationContext);

  if (!authentication) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider",
    );
  }

  return authentication;
}
