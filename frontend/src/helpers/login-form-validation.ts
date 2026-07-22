const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginFormErrors = {
  email?: string;
  password?: string;
};

export function validateLoginForm(
  email: string,
  password: string,
): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!email.trim()) {
    errors.email = "Informe seu e-mail";
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = "Informe um e-mail válido";
  }

  if (!password) {
    errors.password = "Informe sua senha";
  }

  return errors;
}
