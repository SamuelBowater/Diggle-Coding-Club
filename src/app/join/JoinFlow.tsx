"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AVATARS, avatarEmoji } from "@/lib/avatars";
import {
  lookupClassAction,
  registerAction,
  signInAction,
  type LookupState,
  type RegisterState,
  type ClassRoster,
} from "./actions";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white disabled:opacity-50 hover:bg-emerald-500"
    >
      {pending ? "…" : children}
    </button>
  );
}

export function JoinFlow() {
  const [lookup, lookupSubmit] = useActionState<LookupState, FormData>(
    lookupClassAction,
    { status: "idle" },
  );
  const [showNew, setShowNew] = useState(false);

  if (lookup.status === "ok" && !showNew) {
    return <Roster roster={lookup.roster} onNew={() => setShowNew(true)} />;
  }
  if (lookup.status === "ok" && showNew) {
    return <NewStudent onBack={() => setShowNew(false)} />;
  }

  return (
    <form action={lookupSubmit} className="flex flex-col gap-4 text-center">
      <h1 className="text-3xl font-bold">Join your class</h1>
      <p className="opacity-70">Type the class code your teacher put on the screen.</p>
      <input
        name="code"
        autoFocus
        autoComplete="off"
        autoCapitalize="none"
        placeholder="blue-otter-lamp-7"
        className="rounded-xl border px-4 py-3 text-center text-xl"
      />
      {lookup.status === "error" && (
        <p className="text-red-600">{lookup.message}</p>
      )}
      <SubmitButton>Go</SubmitButton>
    </form>
  );
}

function Roster({
  roster,
  onNew,
}: {
  roster: ClassRoster;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 text-center">
      <h1 className="text-3xl font-bold">{roster.className}</h1>
      <p className="opacity-70">Tap your face to carry on.</p>
      {roster.students.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {roster.students.map((s) => (
            <form key={s.id} action={signInAction}>
              <input type="hidden" name="studentId" value={s.id} />
              <button
                type="submit"
                className="flex w-full flex-col items-center gap-1 rounded-2xl border p-3 hover:bg-emerald-50 active:scale-95 dark:hover:bg-emerald-950"
              >
                <span className="text-4xl">{avatarEmoji(s.avatarKey)}</span>
                <span className="truncate text-sm font-medium">{s.displayName}</span>
              </button>
            </form>
          ))}
        </div>
      )}
      <button
        onClick={onNew}
        className="mx-auto rounded-xl border px-6 py-3 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/10"
      >
        I&apos;m new — set me up
      </button>
    </div>
  );
}

function NewStudent({ onBack }: { onBack: () => void }) {
  const [state, submit] = useActionState<RegisterState, FormData>(registerAction, {
    status: "idle",
  });
  const [avatarKey, setAvatarKey] = useState("");

  return (
    <form action={submit} className="flex flex-col gap-4 text-center">
      <h1 className="text-3xl font-bold">Set up your player</h1>

      <label className="text-left text-sm font-medium">
        Your name
        <input
          name="displayName"
          autoFocus
          maxLength={24}
          autoComplete="off"
          className="mt-1 w-full rounded-xl border px-4 py-3 text-lg"
          placeholder="e.g. Sam B"
        />
      </label>

      <p className="text-left text-sm font-medium">Pick an avatar</p>
      <input type="hidden" name="avatarKey" value={avatarKey} />
      <div className="grid grid-cols-5 gap-2">
        {AVATARS.map((a) => (
          <button
            type="button"
            key={a.key}
            aria-label={a.label}
            onClick={() => setAvatarKey(a.key)}
            className={`rounded-xl border p-2 text-3xl active:scale-95 ${
              avatarKey === a.key
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                : ""
            }`}
          >
            {a.emoji}
          </button>
        ))}
      </div>

      {state.status === "error" && <p className="text-red-600">{state.message}</p>}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border px-5 py-3 font-semibold hover:bg-black/5 dark:hover:bg-white/10"
        >
          Back
        </button>
        <SubmitButton>Start coding</SubmitButton>
      </div>
    </form>
  );
}
