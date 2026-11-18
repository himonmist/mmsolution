import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { getCurrentUser } from "@/lib/auth/session";
export const metadata = { title: "Sign in" };
export default async function Page() {
  if (await getCurrentUser()) redirect("/admin");
  return <LoginForm />;
}
