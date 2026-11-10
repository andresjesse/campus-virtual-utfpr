import { createContext } from "react";

import type { AuthenticationContextValue } from "@/types/authentication";

export const AuthenticationContext = createContext<
  AuthenticationContextValue | null
>(null);
