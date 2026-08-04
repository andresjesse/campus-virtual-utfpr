import type {ModalProps} from "@mantine/core";

export type DialogOptions = {
  title: string;
  firstMessage: string,
  secondMessage?: string,
}

export type DialogPropsValue = {
  loading: boolean;
  opened: boolean;
  onCancel: () => void;
  onConfirm: () => void;
} & DialogOptions & ModalProps;

export type DialogContextValue = {
  confirm: (newDialog: DialogOptions) => Promise<boolean>;
}