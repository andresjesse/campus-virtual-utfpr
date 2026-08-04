import {type PropsWithChildren, useCallback, useEffect, useState} from 'react';
import {DialogContext} from "@/contexts/dialog-context.ts";
import type { DialogOptions } from "@/types/user-feedback.ts";
import DialogBox from "@/components/DialogBox.tsx";

type DialogProviderProps = PropsWithChildren

type QueueEntry = {
  dialog: DialogOptions,
  resolve: (confirmed: boolean) => void,
}

export default function DialogProvider({ children }: DialogProviderProps) {
  const [dialogQueue, setDialogQueue] = useState<QueueEntry[]>([])
  const [currentDialog, setCurrentDialog] = useState<DialogOptions | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleNextDialog = useCallback((async () => {
    try {
      setIsLoading(true)
      setCurrentDialog(dialogQueue.shift()?.dialog ?? null)
    } finally {
      setIsLoading(false)
    }
  }), [dialogQueue])

  const confirm = async (newDialog: DialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogQueue((queue) => [
        ...queue,
        { dialog: newDialog, resolve: resolve}
      ])
    })
  }

  const finish = (confirmed: boolean) => {
    const currentEntry = dialogQueue[0]
    currentEntry?.resolve(confirmed);
    setDialogQueue((queue) => queue.slice(1))
    setCurrentDialog(null)
  }

  useEffect(() => {
    if (currentDialog || dialogQueue.length < 1) return;

    void handleNextDialog()
  }, [dialogQueue, handleNextDialog, currentDialog]);

  return (
    <DialogContext value={{ confirm }}>
      { currentDialog && (
        <DialogBox
          {...currentDialog}
          loading={isLoading}
          opened={!!currentDialog}
          onClose={() => finish(false)}
          onCancel={() => finish(false)}
          onConfirm={() => finish(true)}
        />
      ) }

      { children }
    </DialogContext>
  );
}