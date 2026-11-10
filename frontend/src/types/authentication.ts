import type { RecordModel } from "pocketbase";

export type UserRecord = RecordModel & {
  avatar: string;
  department: string;
  email: string;
  emailVisibility: boolean;
  is_admin: boolean;
  name: string;
  surname: string;
  verified: boolean;
};

export type AuthenticationState = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  token: string;
  user: UserRecord | null;
};

export type AuthenticationContextValue = AuthenticationState & {
  authenticate: (email: string, password: string) => Promise<UserRecord>;
  logout: () => void;
};
