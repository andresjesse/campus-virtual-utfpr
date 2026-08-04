import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import PageSearch from "@/components/page-search";
import PageTable from "@/components/page-table/PageTable.tsx";
import {
  deleteContentPage,
  listContentPages,
} from "@/services/content-page-service.ts";
import type { ContentPageListRecord } from "@/types/content-page";

import classes from "./content-page-list.module.css";
import {getContentPageErrorMessage} from "@/helpers/content-pages-service-helper.ts";
import {DialogContext} from "@/contexts/dialog-context.ts";


export default function ContentPageList() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<ContentPageListRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null);

  const dialogBox = useContext(DialogContext)

  const loadPages = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      setPages(await listContentPages());
    } catch (requestError) {
      setError(getContentPageErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredPages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

    return normalizedQuery
      ? pages.filter((page) =>
          page.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
        )
      : pages;
  }, [pages, query]);

  const handleDelete
    = useCallback(async (page: ContentPageListRecord) => {
    const confirmDelete = await dialogBox!.confirm({
      title: "Excluir página",
      firstMessage: `Deseja realmente excluir permanentemente a página ${page?.title ?? 'Sem Título'}?`,
      secondMessage: "Todos os blocos relacionados serão automaticamente excluídos.",
    })

    if (!confirmDelete) return;

    setDeletingPageId(page.id);

    try {
      await deleteContentPage(page.id);
      setPages((currentPages) =>
        currentPages.filter((currentPage) => currentPage.id !== page.id),
      );
      notifications.show({
        color: "green",
        title: "Página excluída",
        message: "A página e seus blocos foram removidos.",
      });
    } catch (deleteError) {
      notifications.show({
        color: "red",
        title: "Não foi possível excluir",
        message: getContentPageErrorMessage(deleteError),
      });
    } finally {
      setDeletingPageId(null);
    }
  }, [dialogBox]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  return (
    <main className={classes.page}>
      <Group className={classes.toolbar} justify="space-between" gap="xl">
        <div className={classes.search}>
          <PageSearch value={query} onChange={setQuery} />
        </div>
        <Button
          variant="outline"
          color="yellow"
          size="sm"
          leftSection={<PlusIcon aria-hidden size={16} />}
          onClick={() => navigate("/admin/pages/new")}
          className={classes.newButton}
        >
          Nova Página
        </Button>
      </Group>

      <section className={classes.results} aria-label="Páginas cadastradas">
        {isLoading && <FeedbackState loading title="Carregando páginas" />}
        {!isLoading && error && (
          <FeedbackState
            title="Não foi possível carregar as páginas"
            description={error}
            actionLabel="Tentar novamente"
            onAction={() => void loadPages()}
          />
        )}
        {!isLoading && !error && pages.length === 0 && (
          <FeedbackState
            title="Nenhuma página cadastrada"
            description="Crie a primeira página para começar."
          />
        )}
        {!isLoading && !error && pages.length > 0 && filteredPages.length === 0 && (
          <FeedbackState
            title="Nenhuma página encontrada"
            description="Tente pesquisar usando outro nome."
          />
        )}
        {!isLoading && !error && filteredPages.length > 0 && (
          <PageTable
            pages={filteredPages}
            deletingPageId={deletingPageId}
            onDelete={(page) => handleDelete(page)}
          />
        )}
      </section>
    </main>
  );
}
