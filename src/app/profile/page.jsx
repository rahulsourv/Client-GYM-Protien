import AccountForm from "@/components/auth/AccountForm";

export const metadata = {
  title: "Admin Profile",
  robots: { index: false },
};

export default function ProfilePage() {
  return <AccountForm profile />;
}
