import { requireAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireAdmin();
  return <AdminShell email={profile.email ?? user.email ?? ""}>{children}</AdminShell>;
}
