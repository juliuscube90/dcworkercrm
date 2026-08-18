"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Mail, Phone, Users } from "lucide-react";
import ContactModal, { type ContactRecord } from "./ContactModal";
import ConfirmDialog from "./ui/ConfirmDialog";
import Button from "./ui/Button";
import { deleteContact } from "@/actions/contacts";

export type ContactRow = ContactRecord & { dealCount: number };

export default function ContactsView({ contacts }: { contacts: ContactRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editing, setEditing] = useState<ContactRecord | null>(null);
  const [deleting, setDeleting] = useState<ContactRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.name, c.primary_contact, c.email, c.phone].some((v) => v?.toLowerCase().includes(q))
    );
  }, [contacts, query]);

  function openCreate() {
    setEditing(null);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }
  function openEdit(c: ContactRow) {
    setEditing(c);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    await deleteContact(deleting.id);
    setDeleteLoading(false);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-4 border-b border-surface-border bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Contacts</h1>
          <p className="text-sm text-ink-500">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"} in your agency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="w-56 rounded-lg border border-surface-border bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus size={15} /> Add contact
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <EmptyState hasQuery={!!query} onAdd={openCreate} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-border bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-muted text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Deals</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-surface-border last:border-0 hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900">{c.name}</p>
                      {c.primary_contact && <p className="text-xs text-ink-500">{c.primary_contact}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-xs text-ink-500">
                        {c.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} /> {c.email}
                          </span>
                        )}
                        {c.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} /> {c.phone}
                          </span>
                        )}
                        {!c.email && !c.phone && <span className="text-ink-400">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.status === "active"
                            ? "bg-accent-soft text-accent"
                            : "bg-surface-muted text-ink-500"
                        }`}
                      >
                        {c.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{c.dealCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-700"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
                          className="rounded-md p-1.5 text-ink-400 hover:bg-danger-soft hover:text-danger"
                          aria-label={`Delete ${c.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ContactModal key={modalKey} open={modalOpen} onClose={closeModal} editing={editing} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete contact"
        description={
          deleting?.dealCount
            ? `${deleting.name} has ${deleting.dealCount} deal${deleting.dealCount === 1 ? "" : "s"} in your pipeline. Deleting this contact will also delete ${deleting.dealCount === 1 ? "that deal" : "those deals"}. This can't be undone.`
            : `Delete ${deleting?.name}? This can't be undone.`
        }
      />
    </div>
  );
}

function EmptyState({ hasQuery, onAdd }: { hasQuery: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-white py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Users size={20} />
      </div>
      <p className="mt-3 text-sm font-medium text-ink-900">
        {hasQuery ? "No contacts match your search" : "No contacts yet"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-ink-500">
        {hasQuery
          ? "Try a different name, email, or phone number."
          : "Add your first contact to start building your pipeline."}
      </p>
      {!hasQuery && (
        <Button className="mt-4" onClick={onAdd}>
          <Plus size={15} /> Add contact
        </Button>
      )}
    </div>
  );
}
