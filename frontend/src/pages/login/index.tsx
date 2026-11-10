import LoginForm from "@/components/login-form";
import AuthenticationLayout from "@/layouts/authentication";
import { branding } from "@/config/branding";
import messages from "@/constants/messages.json";

export default function Login() {
  return (
    <AuthenticationLayout
      title={branding.fullName}
      subtitle={messages.login.subtitle}
    >
      <LoginForm />
    </AuthenticationLayout>
  );
}
