"use client";

import { useState, useTransition } from "react";
import { avatarEmoji } from "@/lib/avatars";
import {
  renameStudentAction,
  deleteStudentAction,
  awardHelperBadgeAction,
  resetStudentProgressAction,
} from "../../actions";

function ago(iso: string | null): string {
  if (!iso) return "never seen";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export function StudentAdmin({
  classId,
  student,
}: {
  classId: string;
  student: {
    id: string;
    displayName: string;
    avatarKey: string;
    xp: number;
    level: number;
    levelName: string;
    badges: number;
    lastSeen: string | null;
  };
}) {
  const [name, setName] = useState(student.displayName);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{avatarEmoji(student.avatarKey)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{student.displayName}</p>
          <p className="text-xs opacity-60">
            Lv {student.level} {student.levelName} · {student.xp} XP ·{" "}
            {student.badges} badge{student.badges === 1 ? "" : "s"} · {ago(student.lastSeen)}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border px-2 py-1 text-xs"
        >
          {open ? "Close" : "Manage"}
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border px-2 py-1 text-sm"
          />
          <button
            disabled={pending || name === student.displayName}
            onClick={() =>
              start(() => renameStudentAction(classId, student.id, name))
            }
            className="rounded-lg border px-2 py-1 text-sm disabled:opacity-40"
          >
            Rename
          </button>
          <button
            disabled={pending}
            onClick={() =>
              start(() => awardHelperBadgeAction(classId, student.id))
            }
            className="rounded-lg border px-2 py-1 text-sm"
          >
            🤝 Give Helper badge
          </button>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Reset ${student.displayName}'s progress and XP?`))
                start(() => resetStudentProgressAction(classId, student.id));
            }}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            Reset progress
          </button>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete ${student.displayName}? This cannot be undone.`))
                start(() => deleteStudentAction(classId, student.id));
            }}
            className="rounded-lg border border-red-300 px-2 py-1 text-sm text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
