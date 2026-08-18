"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, GitBranch } from "lucide-react";
import OpportunityCard from "./OpportunityCard";
import OpportunityModal from "./OpportunityModal";
import ConfirmDialog from "./ui/ConfirmDialog";
import Button from "./ui/Button";
import { STAGES } from "@/lib/stages";
import { formatCurrency } from "@/lib/format";
import { moveOpportunityStage, deleteOpportunity } from "@/actions/opportunities";
import type { OpportunityStage } from "@/lib/database.types";

export type OpportunityRow = {
  id: string;
  title: string;
  stage: OpportunityStage;
  value: number;
  clientId: string;
  clientName: string | null;
  assignedTo: string | null;
  assignedName: string | null;
};

type Option = { id: string; label: string };

export default function PipelineBoard({
  opportunities,
  clients,
  members,
}: {
  opportunities: OpportunityRow[];
  clients: Option[];
  members: Option[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, applyOptimisticMove] = useOptimistic(
    opportunities,
    (state, move: { id: string; stage: OpportunityStage }) =>
      state.map((o) => (o.id === move.id ? { ...o, stage: move.stage } : o))
  );
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editing, setEditing] = useState<OpportunityRow | null>(null);
  const [addStage, setAddStage] = useState<OpportunityStage>("New lead");
  const [deleting, setDeleting] = useState<OpportunityRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return optimisticItems;
    return optimisticItems.filter(
      (o) => o.title.toLowerCase().includes(q) || o.clientName?.toLowerCase().includes(q)
    );
  }, [optimisticItems, query]);

  const byStage = useMemo(() => {
    const map = new Map<OpportunityStage, OpportunityRow[]>();
    for (const s of STAGES) map.set(s.value, []);
    for (const o of filteredItems) map.get(o.stage)?.push(o);
    return map;
  }, [filteredItems]);

  const openValue = useMemo(
    () =>
      optimisticItems
        .filter((o) => o.stage !== "Won" && o.stage !== "Lost")
        .reduce((sum, o) => sum + o.value, 0),
    [optimisticItems]
  );

  function openCreate(stage: OpportunityStage) {
    setEditing(null);
    setAddStage(stage);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }
  function openEdit(o: OpportunityRow) {
    setEditing(o);
    setModalKey((k) => k + 1);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    router.refresh();
  }

  function handleDrop(stage: OpportunityStage) {
    const id = draggingId;
    setDraggingId(null);
    setDragOverStage(null);
    if (!id) return;
    const current = optimisticItems.find((o) => o.id === id);
    if (!current || current.stage === stage) return;

    startTransition(async () => {
      applyOptimisticMove({ id, stage });
      const result = await moveOpportunityStage(id, stage);
      if (!result.error) router.refresh();
      // On error the optimistic value simply reverts once the transition
      // settles, since the underlying `opportunities` prop never changed.
    });
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    await deleteOpportunity(deleting.id);
    setDeleteLoading(false);
    setDeleting(null);
    router.refresh();
  }

  const noContacts = clients.length === 0;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-4 border-b border-surface-border bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Pipeline</h1>
          <p className="text-sm text-ink-500">
            <span className="tabular-nums font-medium text-ink-700">{formatCurrency(openValue)}</span> in open deals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deals…"
              className="w-56 rounded-lg border border-surface-border bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
          </div>
          <Button onClick={() => openCreate("New lead")} disabled={noContacts} title={noContacts ? "Add a contact first" : undefined}>
            <Plus size={15} /> Add deal
          </Button>
        </div>
      </header>

      {noContacts ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <GitBranch size={20} />
          </div>
          <p className="mt-3 text-sm font-medium text-ink-900">Add a contact to start your pipeline</p>
          <p className="mt-1 max-w-xs text-sm text-ink-500">
            Every deal is tied to a contact. Head to Contacts to add your first one.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
          <div className={`flex h-full gap-4 transition-opacity ${isPending ? "opacity-80" : ""}`}>
            {STAGES.map((stage) => {
              const stageItems = byStage.get(stage.value) || [];
              const stageTotal = stageItems.reduce((s, o) => s + o.value, 0);
              const isOver = dragOverStage === stage.value;
              return (
                <div
                  key={stage.value}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverStage(stage.value);
                  }}
                  onDragLeave={() =>
                    setDragOverStage((s) => (s === stage.value ? null : s))
                  }
                  onDrop={() => handleDrop(stage.value)}
                  className={`flex h-full w-72 shrink-0 flex-col rounded-xl border bg-surface-muted/60 transition-colors ${
                    isOver ? "border-accent bg-accent-soft/40" : "border-surface-border"
                  }`}
                >
                  <div className="flex items-center justify-between px-3 pb-2 pt-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: stage.color }}
                      />
                      <span className="text-sm font-semibold text-ink-900">{stage.value}</span>
                      <span className="text-xs text-ink-400">{stageItems.length}</span>
                    </div>
                  </div>
                  <div className="px-3 pb-2 text-xs tabular-nums text-ink-500">
                    {formatCurrency(stageTotal)}
                  </div>

                  <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-2">
                    {stageItems.map((o) => (
                      <OpportunityCard
                        key={o.id}
                        opp={o}
                        dragging={draggingId === o.id}
                        onOpen={() => openEdit(o)}
                        onDelete={() => setDeleting(o)}
                        onDragStart={(e) => {
                          setDraggingId(o.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => openCreate(stage.value)}
                    className="mx-3 mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-surface-border py-2 text-xs font-medium text-ink-500 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <OpportunityModal
        key={modalKey}
        open={modalOpen}
        onClose={closeModal}
        editing={editing}
        clients={clients}
        members={members}
        defaultStage={addStage}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete deal"
        description={`Delete "${deleting?.title}"? This can't be undone.`}
      />
    </div>
  );
}
