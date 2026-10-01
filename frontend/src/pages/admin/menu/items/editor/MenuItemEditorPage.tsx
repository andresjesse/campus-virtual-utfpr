import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import FeedbackState from "@/components/feedback-state";
import MenuItemForm from "@/components/menu/menu-item-form/MenuItemForm.tsx";
import messages from "@/constants/messages.json";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";
import {
  buildMenuItemPageOptions,
  toMenuCategoryOptions,
  toMenuItemFormValues,
} from "@/helpers/menu-item-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { listMenuCategories } from "@/services/menu-category-service.ts";
import {
  createMenuItem,
  getMenuItem,
  listMenuItemPages,
  listMenuItems,
  updateMenuItem,
} from "@/services/menu-item-service.ts";
import type {
  MenuItemCurrentIcon,
  MenuItemFormValues,
  MenuItemOption,
  MenuItemPageOption,
  MenuItemRecord,
} from "@/types/menu.ts";

const EMPTY_MENU_ITEM: MenuItemFormValues = {
  label: "",
  linkType: "link",
  href: "",
  page: "",
  isNested: false,
  parent: "",
  category: "",
  icon: null,
};

export default function MenuItemEditorPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<MenuItemFormValues>(EMPTY_MENU_ITEM);
  const [categoryOptions, setCategoryOptions] = useState<MenuItemOption[]>([]);
  const [pageOptions, setPageOptions] = useState<MenuItemPageOption[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [currentIcon, setCurrentIcon] = useState<MenuItemCurrentIcon>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEditor = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [categories, loadedMenuItems, pages, loadedItem] = await Promise.all([
        listMenuCategories(),
        listMenuItems(),
        listMenuItemPages(),
        itemId ? getMenuItem(itemId) : undefined,
      ]);

      setCategoryOptions(toMenuCategoryOptions(categories));
      setMenuItems(loadedMenuItems);
      setPageOptions(buildMenuItemPageOptions(pages, loadedMenuItems, itemId));

      if (loadedItem) {
        setItem(toMenuItemFormValues(loadedItem));
        setCurrentIcon(loadedItem.icon ? { name: loadedItem.icon } : undefined);
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  const handleSubmit = useCallback(
    async (values: MenuItemFormValues) => {
      if (itemId) {
        await updateMenuItem(itemId, values);
      } else {
        await createMenuItem(values);
      }

      notifications.show({
        color: "green",
        title: messages.menuItems.editor.saveSuccessTitle,
        message: messages.menuItems.editor.saveSuccessMessage,
      });
      navigate("/admin/menu/items");
    },
    [itemId, navigate],
  );

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  if (isLoading) {
    return <FeedbackState loading title={messages.menuItems.editor.loading} />;
  }

  if (!isLoading && error) {
    return (
      <FeedbackState
        title={messages.menuItems.list.loadErrorTitle}
        description={error}
        actionLabel={messages.common.retry}
        onAction={() => void loadEditor()}
      />
    );
  }

  return (
    <EditorPageContainer
      navRoute="/admin/menu/items"
      ariaLabel={
        itemId ? messages.menuItems.editor.editTitle : messages.menuItems.editor.newTitle
      }
    >
      <MenuItemForm
        key={itemId ?? "new"}
        initialValues={item}
        categoryOptions={categoryOptions}
        pageOptions={pageOptions}
        menuItems={menuItems}
        itemId={itemId}
        currentIcon={currentIcon}
        onCategoryCreated={(category) =>
          setCategoryOptions((current) => [
            ...current,
            { value: category.id, label: category.label },
          ])
        }
        onSubmit={handleSubmit}
      />
    </EditorPageContainer>
  );
}
