import { createContext } from "react";
import type { DialogContextValue } from "@/types/user-feedback.ts";

export const DialogContext = createContext<DialogContextValue | null>(null)