import AccountForm from "@/components/auth/AccountForm";

export const metadata = {
  title: "Customer Signup",
  robots: { index: false },
};

export default function SignupPage() {
  return <AccountForm signup />;
}
