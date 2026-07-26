import { NavLink, Stack } from "@mantine/core";
import { CubeIcon } from "@phosphor-icons/react/dist/csr/Cube";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { NavLink as RouterNavLink } from "react-router";

import {
  canAccessAdminCapability,
  type AdminCapability,
} from "@/helpers/authorization/admin-permissions";
import { useAuthentication } from "@/hooks/use-authentication";

import classes from "./admin-navigation.module.css";

type NavigationItem = {
  capability: AdminCapability;
  icon: typeof HouseIcon;
  label: string;
  to: string;
};

type AdminNavigationProps = {
  collapsed?: boolean;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    capability: "pages.manage",
    icon: HouseIcon,
    label: "Páginas",
    to: "/admin/pages",
  },
  {
    capability: "menu.manage",
    icon: ListBulletsIcon,
    label: "Itens e Categorias do Menu",
    to: "/admin/menu-items",
  },
  {
    capability: "entities.manage",
    icon: CubeIcon,
    label: "Entidades 3D",
    to: "/admin/entities",
  },
  {
    capability: "meshes.manage",
    icon: PackageIcon,
    label: "Arquivos Mesh",
    to: "/admin/meshes",
  },
];

function AdminNavigationItem({
  collapsed = false,
  icon: Icon,
  label,
  to,
}: NavigationItem & AdminNavigationProps) {
  return (
    <NavLink
      component={RouterNavLink}
      to={to}
      label={label}
      aria-label={label}
      title={collapsed ? label : undefined}
      leftSection={
        <span className={classes.iconBox}>
          <Icon aria-hidden size={15} weight="regular" />
        </span>
      }
      className={`${classes.link} ${collapsed ? classes.collapsed : ""}`}
    />
  );
}

export default function AdminNavigation({ collapsed = false }: AdminNavigationProps) {
  const { user } = useAuthentication();

  return (
    <Stack component="nav" aria-label="Administração" gap={8}>
      {NAVIGATION_ITEMS.filter(({ capability }) =>
        canAccessAdminCapability(user, capability),
      ).map((item) => (
        <AdminNavigationItem key={item.to} {...item} collapsed={collapsed} />
      ))}
    </Stack>
  );
}
