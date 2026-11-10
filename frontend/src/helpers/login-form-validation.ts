import messages from "@/constants/messages.json";

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
    errors.email = messages.login.validation.emailRequired;
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = messages.login.validation.emailInvalid;
  }

  if (!password) {
    errors.password = messages.login.validation.passwordRequired;
  }

  return errors;
}
