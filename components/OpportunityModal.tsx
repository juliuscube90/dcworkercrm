"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import { ChevronDown, Search } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Label, Input, Select, FieldError } from "./ui/Field";
import { createOpportunity, updateOpportunity, type OpportunityInput } from "@/actions/opportunities";
import { STAGES } from "@/lib/stages";
import type { OpportunityStage } from "@/lib/database.types";
import type { OpportunityRow } from "./PipelineBoard";

type Option = { id: string; label: string };

const emptyForm = (defaultStage: OpportunityStage): OpportunityInput => ({
  client_id: "",
  title: "",
  stage: defaultStage,
  value: 0,
  assigned_to: "",
});

export default function OpportunityModal({
  open,
  onClose,
  editing,
  clients,
  members,
  defaultStage,
}: {
  open: boolean;
  onClose: () => void;
  editing: OpportunityRow | null;
  clients: Option[];
  members: Option[];
  defaultStage: OpportunityStage;
}) {
  // Parent remounts this component (via `key`) each time it opens, so this
  // initial state only needs to be computed once per mount.
  const [form, setForm] = useState<OpportunityInput>(() =>
    editing
      ? {
          client_id: editing.clientId,
          title: editing.title,
          stage: editing.stage,
          value: editing.value,
          assigned_to: editing.assignedTo || "",
        }
      : emptyForm(defaultStage)
  );
  const [clientQuery, setClientQuery] = useState(editing?.clientName || "");
  const [clientOpen, setClientOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setClientOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    if (!q) return clients.slice(0, 8);
    return clients.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 8);
  }, [clients, clientQuery]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.client_id) {
      setError("Choose a contact for this deal.");
      return;
    }
    setLoading(true);
    const result = editing
      ? await updateOpportunity(editing.id, form)
      : await createOpportunity(form);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit deal" : "New deal"}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="o-title">Deal title</Label>
          <Input
            id="o-title"
            required
            autoFocus
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Website redesign — Phase 1"
          />
        </div>

        <div ref={boxRef} className="relative">
          <Label htmlFor="o-client">Contact</Label>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              id="o-client"
              value={clientQuery}
              onFocus={() => setClientOpen(true)}
              onChange={(e) => {
                setClientQuery(e.target.value);
                setClientOpen(true);
                setForm((f) => ({ ...f, client_id: "" }));
              }}
              placeholder={clients.length ? "Search contacts…" : "Add a contact first"}
              disabled={clients.length === 0}
              autoComplete="off"
              className="w-full rounded-lg border border-surface-border bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-surface-muted"
            />
          </div>
          {clientOpen && filteredClients.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-surface-border bg-white shadow-lg">
              {filteredClients.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setForm((f) => ({ ...f, client_id: c.id }));
                    setClientQuery(c.label);
                    setClientOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink-700 hover:bg-surface-muted"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="o-value">Value (USD)</Label>
            <Input
              id="o-value"
              type="number"
              min={0}
              step="0.01"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="o-stage">Stage</Label>
            <div className="relative">
              <Select
                id="o-stage"
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as OpportunityStage }))}
                className="appearance-none pr-8"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </Select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="o-assigned">Assigned to</Label>
          <Select
            id="o-assigned"
            value={form.assigned_to || ""}
            onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>

        <FieldError>{error}</FieldError>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editing ? "Save changes" : "Add deal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
