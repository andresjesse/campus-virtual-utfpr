import {type PropsWithChildren, useCallback, useMemo, useState} from 'react';
import {DialogContext} from "@/contexts/dialog-context.ts";
import type { DialogOptions } from "@/types/user-feedback.ts";
import DialogBox from "@/components/DialogBox.tsx";

type DialogProviderProps = PropsWithChildren

type QueueEntry = {
  dialog: DialogOptions,
  resolve: (confirmed: boolean) => void,
}

export default function DialogProvider({ children }: DialogProviderProps) {
  const [dialogQueue, setDialogQueue] = useState<QueueEntry[]>([]);

  const currentEntry = dialogQueue[0] ?? null;

  const confirm = useCallback((dialog: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogQueue((queue) => [...queue, { dialog, resolve }]);
    });
  }, []);

  const finish = (confirmed: boolean) => {
    if (!currentEntry) return;

    currentEntry.resolve(confirmed);
    setDialogQueue((queue) => queue.slice(1));
  };

  const contextValue = useMemo(() => ({ confirm }), [confirm]);

  return (
    <DialogContext value={contextValue}>
      {children}

      {currentEntry && (
        <DialogBox
          {...currentEntry.dialog}
          loading={false}
          opened
          onClose={() => finish(false)}
          onCancel={() => finish(false)}
          onConfirm={() => finish(true)}
        />
      )}
    </DialogContext>
  );
}