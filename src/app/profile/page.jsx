import AccountForm from "@/components/auth/AccountForm";

export const metadata = {
  title: "Profile",
  robots: { index: false },
};

export default function ProfilePage() {
  return <AccountForm profile />;
}
