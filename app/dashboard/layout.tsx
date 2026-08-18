import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, agencies(name)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Extremely rare: the signup trigger hasn't finished provisioning yet.
    return (
      <div className="flex h-screen items-center justify-center bg-surface-muted text-sm text-ink-500">
        Setting up your workspace…
      </div>
    );
  }

  const agency = Array.isArray(profile.agencies) ? profile.agencies[0] : profile.agencies;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      <Sidebar
        agencyName={agency?.name || "Your agency"}
        fullName={profile.full_name}
        email={user.email || ""}
        role={profile.role}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
