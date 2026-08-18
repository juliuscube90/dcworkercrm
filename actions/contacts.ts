"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/lib/database.types";

export type ContactInput = {
  name: string;
  primary_contact?: string;
  email?: string;
  phone?: string;
  status: ClientStatus;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function requireAgencyId(supabase: SupabaseServerClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .single();
  if (!profile?.agency_id) throw new Error("No agency found for this account.");
  return profile.agency_id;
}

export async function createContact(input: ContactInput) {
  const supabase = await createClient();
  try {
    if (!input.name.trim()) return { error: "Name is required." };
    const agency_id = await requireAgencyId(supabase);
    const { error } = await supabase.from("clients").insert({
      agency_id,
      name: input.name.trim(),
      primary_contact: input.primary_contact?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      status: input.status,
    });
    if (error) return { error: error.message };
    revalidatePath("/dashboard/contacts");
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function updateContact(id: string, input: ContactInput) {
  const supabase = await createClient();
  if (!input.name.trim()) return { error: "Name is required." };
  const { error } = await supabase
    .from("clients")
    .update({
      name: input.name.trim(),
      primary_contact: input.primary_contact?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      status: input.status,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contacts");
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/contacts");
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}
