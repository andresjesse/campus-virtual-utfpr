import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

import { theme } from "@/theme";
import Login from "@/pages/login";

jest.mock("@/config/branding", () => {
  const { mockBrandingModule } =
    jest.requireActual<typeof import("@/mocks/branding")>("@/mocks/branding");
  return mockBrandingModule();
});

jest.mock("@/components/login-form", () => {
  return function MockLoginForm() {
    return <div>login-form-stub</div>;
  };
});

describe("branding application", () => {
  it("shows the configured product name on the login screen", () => {
    render(
      <MantineProvider>
        <Login />
      </MantineProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Aurora Portal" }),
    ).toBeInTheDocument();
  });

  it("exposes the configured primary color through the Mantine theme", () => {
    expect(theme.primaryColor).toBe("brand");
    expect(theme.colors!.brand![5]).toBe("#6650a4");
  });
});
