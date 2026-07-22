import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { LockIcon } from "@phosphor-icons/react/dist/csr/Lock";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  validateLoginForm,
  type LoginFormErrors,
} from "@/helpers/login-form-validation";
import { useAuthentication } from "@/hooks/use-authentication";

import classes from "./login-form.module.css";

const AUTHENTICATION_ERROR = "E-mail ou senha inválidos";

export default function LoginForm() {
  const { authenticate } = useAuthentication();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateLoginForm(email, password);

    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authenticate(email, password);
    } catch {
      setPassword("");
      notifications.show({
        color: "red",
        title: "Não foi possível entrar",
        message: AUTHENTICATION_ERROR,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Stack gap={20}>
        <TextInput
          autoComplete="email"
          label="E-MAIL"
          placeholder="Digite seu e-mail"
          value={email}
          error={formErrors.email}
          disabled={isSubmitting}
          leftSection={<UserIcon size={22} weight="light" />}
          onChange={(event) => {
            setEmail(event.currentTarget.value);
            setFormErrors((currentErrors) => ({
              ...currentErrors,
              email: undefined,
            }));
          }}
          classNames={{
            root: classes.field,
            wrapper: classes.inputWrapper,
            label: classes.label,
            input: classes.input,
            section: classes.inputSection,
            error: classes.fieldError,
          }}
        />

        <PasswordInput
          autoComplete="current-password"
          label="SENHA"
          placeholder="Digite sua senha"
          value={password}
          error={formErrors.password}
          disabled={isSubmitting}
          leftSection={<LockIcon size={22} weight="light" />}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? (
              <EyeSlashIcon size={20} weight="light" />
            ) : (
              <EyeIcon size={20} weight="light" />
            )
          }
          onChange={(event) => {
            setPassword(event.currentTarget.value);
            setFormErrors((currentErrors) => ({
              ...currentErrors,
              password: undefined,
            }));
          }}
          classNames={{
            root: classes.field,
            wrapper: classes.inputWrapper,
            label: classes.label,
            input: classes.input,
            section: classes.inputSection,
            error: classes.fieldError,
          }}
        />

        <Text className={classes.forgotPassword}>
          Esqueceu sua senha?
        </Text>

        <Button
          type="submit"
          loading={isSubmitting}
          className={classes.submitButton}
        >
          ENTRAR
        </Button>
      </Stack>
    </form>
  );
}
