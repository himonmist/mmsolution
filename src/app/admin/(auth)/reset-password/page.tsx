import { ResetForm } from "@/components/admin/AuthForms";
export const metadata = { title: "Reset password" };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = ((await searchParams).token ?? "").slice(0, 200);
  return <ResetForm token={token} />;
}
