import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import AdminBrand from "@/components/admin-brand";
import { applyBranding } from "@/config/apply-branding";
import { branding, getStorageKey, type Branding } from "@/config/branding";

const testBrand: Branding = {
  ...branding,
  organizationName: "Aurora",
  productName: "Portal",
  fullName: "Aurora Portal",
  storageNamespace: "aurora-portal",
  assets: {
    loginBackground: "/branding/aurora-background.webp",
    logo: "/branding/aurora-logo.svg",
  },
  colors: {
    ...branding.colors,
    brand: {
      ...branding.colors.brand,
      primary: "#6650a4",
    },
  },
};

describe("branding", () => {
  it("renders a configured name and logo", () => {
    const { container } = render(
      <MantineProvider>
        <AdminBrand brand={testBrand} />
      </MantineProvider>,
    );

    expect(screen.getByLabelText("Aurora Portal")).toHaveTextContent(
      "Aurora Portal",
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/branding/aurora-logo.svg",
    );
  });

  it("applies configured visual values and namespaces storage keys", () => {
    applyBranding(testBrand);

    expect(document.documentElement).toHaveStyle({
      "--app-brand-primary": "#6650a4",
      "--app-login-background": 'url("/branding/aurora-background.webp")',
    });
    expect(getStorageKey("sidebar", testBrand)).toBe("aurora-portal:sidebar");
  });
});
