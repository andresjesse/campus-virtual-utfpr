import { Box, Button, Flex, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { FormEvent } from "react";

import MenuItemCategoryField from "@/components/menu/menu-item-category-field/MenuItemCategoryField.tsx";
import MenuItemIconDropzone from "@/components/menu/menu-item-icon-dropzone/MenuItemIconDropzone.tsx";
import MenuItemLinkField from "@/components/menu/menu-item-link-field/MenuItemLinkField.tsx";
import MenuItemNestingField from "@/components/menu/menu-item-nesting-field/MenuItemNestingField.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import messages from "@/constants/messages.json";
import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import {
  getMenuItemParentOptions,
  validateMenuItemForm,
} from "@/helpers/menu-item-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import type {
  MenuCategoryRecord,
  MenuItemCurrentIcon,
  MenuItemFormValues,
  MenuItemOption,
  MenuItemPageOption,
  MenuItemRecord,
} from "@/types/menu.ts";

type MenuItemFormProps = {
  initialValues: MenuItemFormValues;
  categoryOptions: MenuItemOption[];
  pageOptions: MenuItemPageOption[];
  menuItems: MenuItemRecord[];
  itemId?: string;
  currentIcon?: MenuItemCurrentIcon;
  onCategoryCreated: (category: MenuCategoryRecord) => void;
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
};

export default function MenuItemForm({
  initialValues,
  categoryOptions,
  pageOptions,
  menuItems,
  itemId,
  currentIcon,
  onCategoryCreated,
  onSubmit,
}: MenuItemFormProps) {
  const [values, setValues] = useState<MenuItemFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof MenuItemFormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validationErrors = validateMenuItemForm(values, Boolean(currentIcon));
  const parentOptions = getMenuItemParentOptions(menuItems, values.category, itemId);

  function errorFor(field: keyof MenuItemFormValues) {
    return submitAttempted || touched[field] ? validationErrors[field] : undefined;
  }

  function touch(field: keyof MenuItemFormValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);

    try {
      await onSubmit(values);
    } catch (submitError) {
      notifications.show({
        color: "red",
        title: messages.common.saveError,
        message: getRequestErrorMessage(submitError),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="menu-item-form" onSubmit={(event) => void handleSubmit(event)}>
      <Stack h="100%" gap={0}>
        <FormMetadataSection>
          <TitleInput
            withAsterisk
            label={messages.menuItems.editor.labelLabel}
            placeholder={messages.menuItems.editor.labelPlaceholder}
            value={values.label}
            error={errorFor("label")}
            onBlur={() => touch("label")}
            onChange={(event) =>
              setValues({ ...values, label: event.currentTarget.value })
            }
          />
        </FormMetadataSection>

        <FormBodySection flex="1 1 auto" pt="lg">
          <Stack h="100%" gap="lg">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={{ base: "1rem", md: "2.5rem" }}
              align="flex-start"
            >
              <Stack flex={1} w="100%" gap="lg">
                <MenuItemLinkField
                  linkType={values.linkType}
                  href={values.href}
                  page={values.page}
                  pageOptions={pageOptions}
                  hrefError={errorFor("href")}
                  pageError={errorFor("page")}
                  onLinkTypeChange={(linkType) => setValues({ ...values, linkType })}
                  onHrefBlur={() => touch("href")}
                  onHrefChange={(href) => setValues({ ...values, href })}
                  onPageBlur={() => touch("page")}
                  onPageChange={(page) => setValues({ ...values, page })}
                />
                <MenuItemCategoryField
                  options={categoryOptions}
                  value={values.category}
                  error={errorFor("category")}
                  onBlur={() => touch("category")}
                  // Clearing the parent keeps the child in its parent's category.
                  onChange={(category) => setValues({ ...values, category, parent: "" })}
                  onCategoryCreated={(category) => {
                    onCategoryCreated(category);
                    setValues((current) => ({ ...current, category: category.id }));
                  }}
                />
              </Stack>

              <Stack flex={1} w="100%">
                <MenuItemNestingField
                  isNested={values.isNested}
                  parent={values.parent}
                  parentOptions={parentOptions}
                  hasCategory={Boolean(values.category)}
                  error={errorFor("parent")}
                  onNestedChange={(isNested) => setValues({ ...values, isNested })}
                  onParentBlur={() => touch("parent")}
                  onParentChange={(parent) => setValues({ ...values, parent })}
                />
              </Stack>
            </Flex>

            <Box>
              <MenuItemIconDropzone
                value={values.icon}
                currentIcon={currentIcon}
                error={errorFor("icon")}
                onChange={(icon) => {
                  touch("icon");
                  setValues((current) => ({ ...current, icon }));
                }}
              />
            </Box>

            <Group justify="flex-end" py="lg" mt="auto">
              <Button
                variant="outline"
                color="brand"
                size="sm"
                type="submit"
                form="menu-item-form"
                loading={isSaving}
              >
                {messages.common.save}
              </Button>
            </Group>
          </Stack>
        </FormBodySection>
      </Stack>
    </form>
  );
}
