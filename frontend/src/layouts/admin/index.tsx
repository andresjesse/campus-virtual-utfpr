import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";

import AdminBrand from "@/components/admin-brand";
import AdminNavigation from "@/components/admin-navigation";
import AdminUserSummary from "@/components/admin-user-summary";

import classes from "./admin-layout.module.css";

const SIDEBAR_STORAGE_KEY = "campus-virtual:admin-sidebar-collapsed";

export default function AdminLayout() {
  const [opened, { toggle }] = useDisclosure();
  const [desktopCollapsed, setDesktopCollapsed] = useState(
    () => window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
  );

  useEffect(() => {
    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(desktopCollapsed),
    );
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
            aria-label="Abrir navegação"
          />
          <AdminBrand />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={8}>
        <AppShell.Section grow>
          <AdminNavigation collapsed={desktopCollapsed} />
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
            onClick={() => setDesktopCollapsed((collapsed) => !collapsed)}
            aria-label={desktopCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            <CaretDoubleLeftIcon
              size={18}
              className={desktopCollapsed ? classes.rotated : undefined}
            />
          </button>
        </AppShell.Section>
        <AppShell.Section>
          <AdminUserSummary collapsed={desktopCollapsed} />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
