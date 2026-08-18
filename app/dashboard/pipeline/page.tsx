import { createClient } from "@/lib/supabase/server";
import PipelineBoard, { type OpportunityRow } from "@/components/PipelineBoard";

export default async function PipelinePage() {
  const supabase = await createClient();

  const [{ data: opps, error }, { data: clients }, { data: members }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, title, stage, value, client_id, assigned_to, clients(name), profiles(full_name)")
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("profiles").select("id, full_name").order("full_name"),
  ]);

  if (error) {
    return <div className="p-6 text-sm text-danger">Couldn&apos;t load pipeline: {error.message}</div>;
  }

  const opportunities: OpportunityRow[] = (opps || []).map((o) => {
    const client = Array.isArray(o.clients) ? o.clients[0] : o.clients;
    const assigned = Array.isArray(o.profiles) ? o.profiles[0] : o.profiles;
    return {
      id: o.id,
      title: o.title,
      stage: o.stage,
      value: o.value,
      clientId: o.client_id,
      clientName: client?.name ?? null,
      assignedTo: o.assigned_to,
      assignedName: assigned?.full_name ?? null,
    };
  });

  const clientOptions = (clients || []).map((c) => ({ id: c.id, label: c.name }));
  const memberOptions = (members || [])
    .filter((m) => m.full_name)
    .map((m) => ({ id: m.id, label: m.full_name as string }));

  return <PipelineBoard opportunities={opportunities} clients={clientOptions} members={memberOptions} />;
}
