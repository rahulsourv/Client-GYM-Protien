import AccountForm from "@/components/auth/AccountForm";

export const metadata = {
  title: "Login",
  robots: { index: false },
};

export default function LoginPage() {
  return <AccountForm />;
}
