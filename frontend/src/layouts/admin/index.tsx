import { AppShell, Burger, Group, useMantineTheme } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";

import AdminBrand from "@/components/admin-brand";
import AdminNavigation from "@/components/admin-navigation";
import AdminUserSummary from "@/components/admin-user-summary";
import { getStorageKey } from "@/config/branding";
import messages from "@/constants/messages.json";
import { readStorageItem, writeStorageItem } from "@/helpers/storage-helper.ts";

import classes from "./admin-layout.module.css";

const SIDEBAR_STORAGE_KEY = getStorageKey("admin-sidebar-collapsed");

export default function AdminLayout() {
  const theme = useMantineTheme();
  const [opened, { toggle, close }] = useDisclosure();
  const [desktopCollapsed, setDesktopCollapsed] = useState(
    () => readStorageItem(SIDEBAR_STORAGE_KEY) === "true",
  );
  const desktopQuery = `(min-width: ${theme.breakpoints.sm})`;
  const isDesktop = useMediaQuery(desktopQuery, window.matchMedia(desktopQuery).matches, {
    getInitialValueInEffect: false,
  });
  const collapsed = desktopCollapsed && isDesktop;

  useEffect(() => {
    writeStorageItem(SIDEBAR_STORAGE_KEY, String(desktopCollapsed));
  }, [desktopCollapsed]);

  return (
    <AppShell
      padding={0}
      header={{ height: 60 }}
      navbar={{
        width: desktopCollapsed ? 64 : 256,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      classNames={{
        header: classes.header,
        navbar: classes.navbar,
        main: classes.main,
      }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: 16 }} gap="sm">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            aria-label={
              opened
                ? messages.adminLayout.closeNavigationLabel
                : messages.adminLayout.openNavigationLabel
            }
          />
          <AdminBrand />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={8}>
        <AppShell.Section grow>
          <AdminNavigation collapsed={collapsed} onNavigate={close} />
        </AppShell.Section>
        <AppShell.Section
          visibleFrom="sm"
          className={`${classes.collapseSection} ${
            desktopCollapsed ? classes.collapseSectionFolded : ""
          }`}
        >
          <button
            type="button"
            className={classes.collapseButton}
            onClick={() => setDesktopCollapsed((current) => !current)}
            aria-label={
              desktopCollapsed
                ? messages.adminLayout.expandMenuLabel
                : messages.adminLayout.collapseMenuLabel
            }
          >
            <CaretDoubleLeftIcon
              size={18}
              className={desktopCollapsed ? classes.rotated : undefined}
            />
          </button>
        </AppShell.Section>
        <AppShell.Section>
          <AdminUserSummary collapsed={collapsed} />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
