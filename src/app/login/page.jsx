import PageHeader from "@/components/layout/PageHeader";

export const metadata = {
  title: "Login",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <PageHeader
      lines={["Login"]}
      description="Account login is currently unavailable."
      crumbs={[{ label: "Login" }]}
    />
  );
}
