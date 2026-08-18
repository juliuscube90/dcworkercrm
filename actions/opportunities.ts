"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OpportunityStage } from "@/lib/database.types";

export type OpportunityInput = {
  client_id: string;
  title: string;
  stage: OpportunityStage;
  value: number;
  assigned_to?: string | null;
};

export async function createOpportunity(input: OpportunityInput) {
  const supabase = await createClient();
  if (!input.title.trim()) return { error: "Title is required." };
  if (!input.client_id) return { error: "Choose a contact for this deal." };
  const { error } = await supabase.from("opportunities").insert({
    client_id: input.client_id,
    title: input.title.trim(),
    stage: input.stage,
    value: Number.isFinite(input.value) ? input.value : 0,
    assigned_to: input.assigned_to || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}

export async function updateOpportunity(id: string, input: OpportunityInput) {
  const supabase = await createClient();
  if (!input.title.trim()) return { error: "Title is required." };
  const { error } = await supabase
    .from("opportunities")
    .update({
      client_id: input.client_id,
      title: input.title.trim(),
      stage: input.stage,
      value: Number.isFinite(input.value) ? input.value : 0,
      assigned_to: input.assigned_to || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}

export async function moveOpportunityStage(id: string, stage: OpportunityStage) {
  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").update({ stage }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/pipeline");
  return { error: null };
}
