import LoginForm from "@/components/login-form";
import AuthenticationLayout from "@/layouts/authentication";

export default function Login() {
  return (
    <AuthenticationLayout
      title="UTFPR Virtual"
      subtitle="ACESSO AO PORTAL ADMINISTRATIVO"
    >
      <LoginForm />
    </AuthenticationLayout>
  );
}
