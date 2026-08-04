import type PocketBase from "pocketbase";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import { AuthenticationContext } from "@/contexts/authentication-context";
import { pocketbase } from "@/services/pocketbase";
import type {
  AuthenticationContextValue,
  AuthenticationState,
  UserRecord,
} from "@/types/authentication";
import {USERS_COLLECTION} from "@/constants/user-constants.ts";

type AuthenticationProviderProps = PropsWithChildren<{
  pocketbaseClient?: PocketBase;
}>;

function readAuthenticationState(
  pocketbaseClient: PocketBase,
  isInitializing: boolean,
): AuthenticationState {
  const isAuthenticated =
    pocketbaseClient.authStore.isValid &&
    pocketbaseClient.authStore.record?.collectionName === USERS_COLLECTION;

  return {
    isAuthenticated,
    isInitializing,
    token: isAuthenticated ? pocketbaseClient.authStore.token : "",
    user: isAuthenticated
      ? (pocketbaseClient.authStore.record as UserRecord)
      : null,
  };
}

export function AuthenticationProvider({
  children,
  pocketbaseClient = pocketbase,
}: AuthenticationProviderProps) {
  const [authenticationState, setAuthenticationState] =
    useState<AuthenticationState>(() =>
      readAuthenticationState(pocketbaseClient, true),
    );

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = pocketbaseClient.authStore.onChange(() => {
      if (isMounted) {
        setAuthenticationState((currentState) =>
          readAuthenticationState(
            pocketbaseClient,
            currentState.isInitializing,
          ),
        );
      }
    });

    async function initializeAuthentication() {
      if (pocketbaseClient.authStore.isValid) {
        try {
          await pocketbaseClient
            .collection<UserRecord>(USERS_COLLECTION)
            .authRefresh();
        } catch {
          pocketbaseClient.authStore.clear();
        }
      }

      if (isMounted) {
        setAuthenticationState(
          readAuthenticationState(pocketbaseClient, false),
        );
      }
    }

    void initializeAuthentication();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [pocketbaseClient]);

  const authenticate = useCallback(
    async (email: string, password: string) => {
      const authenticationResponse = await pocketbaseClient
        .collection<UserRecord>(USERS_COLLECTION)
        .authWithPassword(email.trim(), password);

      return authenticationResponse.record;
    },
    [pocketbaseClient],
  );

  const logout = useCallback(() => {
    pocketbaseClient.authStore.clear();
  }, [pocketbaseClient]);

  const contextValue = useMemo<AuthenticationContextValue>(
    () => ({
      ...authenticationState,
      authenticate,
      logout,
    }),
    [authenticationState, authenticate, logout],
  );

  return (
    <AuthenticationContext value={contextValue}>
      {children}
    </AuthenticationContext>
  );
}
