"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/database.types";

async function requireInviter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.agency_id) throw new Error("No agency found.");
  if (profile.role !== "owner" && profile.role !== "admin") {
    throw new Error("Only owners and admins can invite team members.");
  }

  return { supabase, agencyId: profile.agency_id };
}

export async function inviteStaff(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "staff") as AppRole;

  if (!email) return { error: "Email is required." };
  if (!["admin", "staff", "client"].includes(role)) {
    return { error: "Invalid role." };
  }

  try {
    const { agencyId } = await requireInviter();
    const admin = createAdminClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { agency_id: agencyId, role },
      redirectTo: siteUrl ? `${siteUrl}/auth/confirm` : undefined,
    });

    if (error) return { error: error.message };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to invite." };
  }

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function removeTeamMember(profileId: string) {
  const { supabase, agencyId } = await requireInviter();

  // Only remove members within the caller's own agency.
  const { data: target } = await supabase
    .from("profiles")
    .select("agency_id, role")
    .eq("id", profileId)
    .single();

  if (!target || target.agency_id !== agencyId) {
    throw new Error("Member not found in your agency.");
  }
  if (target.role === "owner") {
    throw new Error("Can't remove the agency owner.");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profileId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/team");
}
