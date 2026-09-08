"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function TeacherLogin() {
  const [state, submit] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Teacher sign in</h1>
      <form action={submit} className="flex flex-col gap-3">
        <input
          type="password"
          name="password"
          autoFocus
          placeholder="Teacher password"
          className="rounded-xl border px-4 py-3 text-lg"
        />
        {state.error && <p className="text-red-600">{state.error}</p>}
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-lg font-semibold text-white hover:bg-emerald-500"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
