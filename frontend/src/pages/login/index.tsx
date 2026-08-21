import LoginForm from "@/components/login-form";
import AuthenticationLayout from "@/layouts/authentication";
import { branding } from "@/config/branding";

export default function Login() {
  return (
    <AuthenticationLayout
      title={branding.fullName}
      subtitle="ACESSO AO PORTAL ADMINISTRATIVO"
    >
      <LoginForm />
    </AuthenticationLayout>
  );
}
