"use client";

import { useState, FormEvent } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Label, Input, Select, FieldError } from "./ui/Field";
import { createContact, updateContact, type ContactInput } from "@/actions/contacts";
import type { ClientStatus } from "@/lib/database.types";

export type ContactRecord = {
  id: string;
  name: string;
  primary_contact: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
};

const empty: ContactInput = { name: "", primary_contact: "", email: "", phone: "", status: "active" };

// Parent remounts this component (via `key`) each time it opens, so initial
// state below only needs to be computed once per mount — no reset-effect.
export default function ContactModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: ContactRecord | null;
}) {
  const [form, setForm] = useState<ContactInput>(() =>
    editing
      ? {
          name: editing.name,
          primary_contact: editing.primary_contact || "",
          email: editing.email || "",
          phone: editing.phone || "",
          status: editing.status,
        }
      : empty
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = editing
      ? await updateContact(editing.id, form)
      : await createContact(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit contact" : "New contact"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="c-name">Name</Label>
          <Input
            id="c-name"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Acme Roofing Co."
          />
        </div>
        <div>
          <Label htmlFor="c-contact">Primary contact</Label>
          <Input
            id="c-contact"
            value={form.primary_contact}
            onChange={(e) => setForm((f) => ({ ...f, primary_contact: e.target.value }))}
            placeholder="Jordan Lee"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="jordan@acme.com"
            />
          </div>
          <div>
            <Label htmlFor="c-phone">Phone</Label>
            <Input
              id="c-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(555) 010-0199"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="c-status">Status</Label>
          <Select
            id="c-status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ClientStatus }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <FieldError>{error}</FieldError>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editing ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
