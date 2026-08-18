import { createClient } from "@/lib/supabase/server";
import ContactsView, { type ContactRow } from "@/components/ContactsView";

export default async function ContactsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, primary_contact, email, phone, status, created_at, opportunities(count)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-sm text-danger">Couldn&apos;t load contacts: {error.message}</div>
    );
  }

  const contacts: ContactRow[] = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    primary_contact: c.primary_contact,
    email: c.email,
    phone: c.phone,
    status: c.status,
    dealCount: Array.isArray(c.opportunities) ? c.opportunities[0]?.count ?? 0 : 0,
  }));

  return <ContactsView contacts={contacts} />;
}
