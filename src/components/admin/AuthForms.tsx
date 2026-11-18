"use client";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction, forgotAction, resetAction, type ActionResult } from "@/app/admin/actions";

function Msg({ s }: { s: ActionResult | null }) {
  if (!s) return null;
  return <p role="alert" className={`rounded-lg px-3 py-2 text-sm ${s.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{s.ok ? s.message : s.error}</p>;
}
const Btn = ({ pending, children }: { pending: boolean; children: React.ReactNode }) => (
  <button type="submit" disabled={pending} className="btn btn-primary w-full">{pending && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>
);

export function LoginForm() {
  const [s, act, pending] = useActionState(loginAction, null);
  return (
    <form action={act} className="space-y-4">
      <h1 className="display text-2xl text-ink">Sign in to the CMS</h1>
      <Msg s={s} />
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={160} autoComplete="username" className="field" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required maxLength={128} autoComplete="current-password" className="field" /></div>
      <Btn pending={pending}>Sign in</Btn>
      <Link href="/admin/forgot-password" className="block text-center text-sm font-semibold text-brand-blue">Forgot password?</Link>
    </form>
  );
}

export function ForgotForm() {
  const [s, act, pending] = useActionState(forgotAction, null);
  return (
    <form action={act} className="space-y-4">
      <h1 className="display text-2xl text-ink">Reset your password</h1>
      <p className="text-sm text-slate">Enter your account email and we&apos;ll send a reset link valid for 30 minutes.</p>
      <Msg s={s} />
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required maxLength={160} className="field" /></div>
      <Btn pending={pending}>Send reset link</Btn>
      <Link href="/admin/login" className="block text-center text-sm font-semibold text-brand-blue">Back to sign in</Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [s, act, pending] = useActionState(resetAction, null);
  return (
    <form action={act} className="space-y-4">
      <h1 className="display text-2xl text-ink">Choose a new password</h1>
      <p className="text-sm text-slate">At least 12 characters, mixing upper/lower case, numbers and symbols.</p>
      <Msg s={s} />
      <input type="hidden" name="token" value={token} />
      <div><label className="label" htmlFor="password">New password</label><input id="password" name="password" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className="field" /></div>
      <div><label className="label" htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" required minLength={12} maxLength={72} autoComplete="new-password" className="field" /></div>
      <Btn pending={pending}>Update password</Btn>
      <Link href="/admin/login" className="block text-center text-sm font-semibold text-brand-blue">Back to sign in</Link>
    </form>
  );
}
