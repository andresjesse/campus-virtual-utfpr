import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import FeedbackState from "@/components/feedback-state";
import MenuCategoryForm from "@/components/menu/menu-category-form/MenuCategoryForm.tsx";
import messages from "@/constants/messages.json";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import {
  createMenuCategory,
  getMenuCategory,
  updateMenuCategory,
} from "@/services/menu-category-service.ts";
import type { MenuCategoryFormValues } from "@/types/menu.ts";

const EMPTY_MENU_CATEGORY: MenuCategoryFormValues = {
  label: "",
};

export default function MenuCategoryEditorPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<MenuCategoryFormValues>(EMPTY_MENU_CATEGORY);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEditor = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      if (categoryId) {
        const loadedCategory = await getMenuCategory(categoryId);

        setCategory({ label: loadedCategory.label });
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  const handleSubmit = useCallback(
    async (values: MenuCategoryFormValues) => {
      if (categoryId) {
        await updateMenuCategory(categoryId, values);
      } else {
        await createMenuCategory(values);
      }

      notifications.show({
        color: "green",
        title: messages.menuCategories.editor.saveSuccessTitle,
        message: messages.menuCategories.editor.saveSuccessMessage,
      });
      navigate("/admin/menu/categories");
    },
    [categoryId, navigate],
  );

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  if (isLoading) {
    return <FeedbackState loading title={messages.menuCategories.editor.loading} />;
  }

  if (!isLoading && error) {
    return (
      <FeedbackState
        title={messages.menuCategories.list.loadErrorTitle}
        description={error}
        actionLabel={messages.common.retry}
        onAction={() => void loadEditor()}
      />
    );
  }

  return (
    <EditorPageContainer
      navRoute="/admin/menu/categories"
      ariaLabel={
        categoryId
          ? messages.menuCategories.editor.editTitle
          : messages.menuCategories.editor.newTitle
      }
    >
      <MenuCategoryForm
        key={categoryId ?? "new"}
        initialValues={category}
        onSubmit={handleSubmit}
      />
    </EditorPageContainer>
  );
}
