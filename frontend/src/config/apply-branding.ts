import type { Branding } from "./branding";

export function applyBranding(brand: Branding, root = document.documentElement) {
  const variables = {
    "--app-brand-primary": brand.colors.brand.primary,
    "--app-brand-primary-hover": brand.colors.brand.primaryHover,
    "--app-brand-on-primary": brand.colors.brand.onPrimary,
    "--app-surface-page": brand.colors.surface.page,
    "--app-surface-header": brand.colors.surface.header,
    "--app-surface-sidebar": brand.colors.surface.sidebar,
    "--app-surface-panel": brand.colors.surface.panel,
    "--app-surface-interactive": brand.colors.surface.interactive,
    "--app-surface-interactive-hover": brand.colors.surface.interactiveHover,
    "--app-border-default": brand.colors.border.default,
    "--app-border-strong": brand.colors.border.strong,
    "--app-text-primary": brand.colors.text.primary,
    "--app-text-muted": brand.colors.text.muted,
    "--app-text-subtle": brand.colors.text.subtle,
    "--app-feedback-success": brand.colors.feedback.success,
    "--app-feedback-warning": brand.colors.feedback.warning,
    "--app-feedback-error": brand.colors.feedback.error,
    "--app-feedback-info": brand.colors.feedback.info,
    "--app-login-background": `url("${brand.assets.loginBackground}")`,
  } as const;

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

