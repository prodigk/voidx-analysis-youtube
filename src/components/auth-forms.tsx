"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

type AuthState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "error"; message: string };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AuthState>({ status: "idle" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "로그인에 실패했습니다.",
      });
      return;
    }

    router.push(searchParams.get("next") || "/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <AuthInput
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <AuthInput
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
      />
      <AuthError state={state} />
      <AuthSubmitButton loading={state.status === "loading"}>
        로그인
      </AuthSubmitButton>
    </form>
  );
}

export function AdminSignupForm({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "idle" });
  const [email, setEmail] = useState(adminEmail);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setState({ status: "error", message: "비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    setState({ status: "loading" });

    const response = await fetch("/api/auth/admin/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "Admin 생성에 실패했습니다.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <AuthInput
        label="Admin 이메일"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        required
      />
      <AuthInput
        label="이름"
        value={name}
        onChange={setName}
        autoComplete="name"
        required
      />
      <AuthInput
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        required
      />
      <AuthInput
        label="비밀번호 확인"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        required
      />
      <AuthError state={state} />
      <AuthSubmitButton loading={state.status === "loading"}>
        Admin 계정 생성
      </AuthSubmitButton>
    </form>
  );
}

export function InviteSignupForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "idle" });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setState({ status: "error", message: "비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    setState({ status: "loading" });

    const response = await fetch("/api/auth/invite/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "가입에 실패했습니다.",
      });
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="rounded-[8px] border border-[#dddddd] bg-[#f7f7f7] px-3 py-3">
        <p className="text-xs font-semibold text-[#6a6a6a]">초대 이메일</p>
        <p className="mt-1 text-sm font-semibold text-[#222222]">{email}</p>
      </div>
      <AuthInput
        label="이름"
        value={name}
        onChange={setName}
        autoComplete="name"
        required
      />
      <AuthInput
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        required
      />
      <AuthInput
        label="비밀번호 확인"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        required
      />
      <AuthError state={state} />
      <AuthSubmitButton loading={state.status === "loading"}>
        초대 수락하고 가입
      </AuthSubmitButton>
    </form>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[#3f3f3f]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="h-14 rounded-[8px] border border-[#dddddd] bg-white px-3 text-base text-[#222222] outline-none transition focus:border-2 focus:border-[#222222]"
      />
    </label>
  );
}

function AuthError({ state }: { state: AuthState }) {
  if (state.status !== "error") {
    return null;
  }

  return (
    <p className="rounded-[8px] bg-[#fff1ed] px-3 py-2 text-sm leading-6 text-[#c13515]">
      {state.message}
    </p>
  );
}

function AuthSubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ff385c] px-6 text-base font-medium text-white transition hover:bg-[#e00b41] disabled:cursor-not-allowed disabled:bg-[#ffd1da]"
    >
      {loading ? (
        <Loader2 size={17} className="animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight size={17} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
