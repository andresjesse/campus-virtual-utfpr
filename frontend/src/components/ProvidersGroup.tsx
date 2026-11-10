import {  type ReactNode } from 'react';
import {AuthenticationProvider} from "@/providers/authentication-provider.tsx";
import DialogProvider from "@/providers/dialog-provider.tsx";

type ProvidersGroupProps = {
  children: ReactNode;
}

export default function ProvidersGroup({ children }: ProvidersGroupProps) {
  return (
    <AuthenticationProvider>
      <DialogProvider>
        { children }
      </DialogProvider>
    </AuthenticationProvider>
  );
}