import { notifications } from "@mantine/notifications";
import { useCallback, useContext, useEffect, useState } from "react";

import messages from "@/constants/messages.json";
import { DialogContext } from "@/contexts/dialog-context.ts";
import { formatMessage } from "@/helpers/message-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { useLocaleSearch } from "@/hooks/use-locale-search.ts";

type DeleteFlowTexts = {
  deleteConfirmTitle: string;
  deleteConfirmFirst: string;
  deleteConfirmSecond?: string;
  deletedTitle: string;
  deletedMessage: string;
};

type UseRecordListOptions<T> = {
  texts: DeleteFlowTexts;
  listRecords: () => Promise<T[]>;
  deleteRecord: (id: string) => Promise<unknown>;
  getSearchableText: (record: T) => string;
  getName: (record: T) => string;
};

export function useRecordList<T extends { id: string }>({
  texts,
  listRecords,
  deleteRecord,
  getSearchableText,
  getName,
}: UseRecordListOptions<T>) {
  const [records, setRecords] = useState<T[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dialogBox = useContext(DialogContext);

  const reload = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      setRecords(await listRecords());
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- listRecords is a stable service function
  }, []);

  const requestDelete = useCallback(
    async (record: T) => {
      if (!dialogBox) return;

      const confirmed = await dialogBox.confirm({
        title: texts.deleteConfirmTitle,
        firstMessage: formatMessage(texts.deleteConfirmFirst, getName(record)),
        secondMessage: texts.deleteConfirmSecond,
      });

      if (!confirmed) return;

      setDeletingId(record.id);

      try {
        await deleteRecord(record.id);
        await reload();
        notifications.show({
          color: "green",
          title: texts.deletedTitle,
          message: texts.deletedMessage,
        });
      } catch (deleteError) {
        notifications.show({
          color: "red",
          title: messages.common.deleteErrorTitle,
          message: getRequestErrorMessage(deleteError),
        });
      } finally {
        setDeletingId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- texts and the callbacks are stable
    [dialogBox, reload],
  );

  const filtered = useLocaleSearch(records, query, getSearchableText);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    records,
    filtered,
    query,
    setQuery,
    isLoading,
    error,
    reload,
    deletingId,
    requestDelete,
  };
}
