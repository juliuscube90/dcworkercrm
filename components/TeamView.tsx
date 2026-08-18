"use client";

import { useState, useTransition } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { inviteStaff, removeTeamMember } from "@/actions/team";
import { initials } from "@/lib/format";
import type { AppRole } from "@/lib/database.types";

type Member = {
  id: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
};

const ROLE_LABEL: Record<AppRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  client: "Client",
};

export default function TeamView({
  members,
  currentUserId,
  canManage,
}: {
  members: Member[];
  currentUserId: string;
  currentUserEmail: string;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );

  function handleInvite(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      const result = await inviteStaff(formData);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "Invite sent." });
        const form = document.getElementById("invite-form") as HTMLFormElement | null;
        form?.reset();
      }
    });
  }

  function handleRemove(id: string) {
    if (!confirm("Remove this team member? This can't be undone.")) return;
    startTransition(async () => {
      try {
        await removeTeamMember(id);
      } catch (err) {
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to remove member.",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <h1 className="text-xl font-semibold text-ink-900">Team</h1>
      <p className="mt-1 text-sm text-ink-500">
        Manage who has access to your agency's workspace.
      </p>

      {canManage && (
        <form
          id="invite-form"
          action={handleInvite}
          className="mt-6 flex items-end gap-3 rounded-xl border border-border bg-white p-4"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink-500">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="teammate@example.com"
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-500">Role</label>
            <select
              name="role"
              defaultValue="staff"
              className="mt-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <UserPlus size={15} />
            Invite
          </button>
        </form>
      )}

      {status && (
        <p
          className={`mt-3 text-sm ${
            status.type === "error" ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-white">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-700">
              {initials(member.full_name || "?")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">
                {member.full_name || "Pending — invite not yet accepted"}
                {member.id === currentUserId && (
                  <span className="ml-1.5 text-xs font-normal text-ink-400">(you)</span>
                )}
              </p>
              <p className="text-xs text-ink-500">{ROLE_LABEL[member.role]}</p>
            </div>
            {canManage && member.role !== "owner" && member.id !== currentUserId && (
              <button
                onClick={() => handleRemove(member.id)}
                disabled={isPending}
                aria-label="Remove member"
                title="Remove member"
                className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
