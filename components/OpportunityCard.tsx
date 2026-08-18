"use client";

import { Trash2, GripVertical } from "lucide-react";
import { formatCurrency, initials } from "@/lib/format";
import { STAGE_COLOR } from "@/lib/stages";
import type { OpportunityRow } from "./PipelineBoard";

export default function OpportunityCard({
  opp,
  onOpen,
  onDelete,
  onDragStart,
  dragging,
}: {
  opp: OpportunityRow;
  onOpen: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className={`group cursor-pointer rounded-lg border border-surface-border bg-white p-3 shadow-sm transition-all hover:border-accent/40 hover:shadow-md ${
        dragging ? "opacity-40" : ""
      }`}
      style={{ borderLeft: `3px solid ${STAGE_COLOR[opp.stage]}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-ink-900">{opp.title}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete opportunity"
          className="shrink-0 rounded p-1 text-ink-400 opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {opp.clientName && (
        <p className="mt-1 truncate text-xs text-ink-500">{opp.clientName}</p>
      )}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="tabular-nums text-sm font-semibold text-ink-900">
          {formatCurrency(opp.value)}
        </span>
        <div className="flex items-center gap-1.5">
          {opp.assignedName && (
            <div
              title={opp.assignedName}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-[9px] font-semibold text-accent"
            >
              {initials(opp.assignedName)}
            </div>
          )}
          <span className="cursor-grab text-ink-400 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
            <GripVertical size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
