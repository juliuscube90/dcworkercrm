import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeamView from "@/components/TeamView";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.agency_id) redirect("/dashboard");

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: true });

  return (
    <TeamView
      members={members || []}
      currentUserId={user.id}
      currentUserEmail={user.email || ""}
      canManage={profile.role === "owner" || profile.role === "admin"}
    />
  );
}
