"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, UserPlus } from "lucide-react";
import type {
  MemberInvite,
  MemberUser,
  UserRole,
  UserStatus,
} from "@/lib/auth";

type MemberState =
  | { status: "idle"; message?: string; inviteUrl?: string }
  | { status: "loading"; message?: string; inviteUrl?: string }
  | { status: "success"; message: string; inviteUrl?: string }
  | { status: "error"; message: string; inviteUrl?: string };

export function MemberManagement({
  users,
  invites,
  currentUserId,
}: {
  users: MemberUser[];
  invites: MemberInvite[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<MemberState>({ status: "idle" });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [copied, setCopied] = useState(false);
  const activeUsers = useMemo(
    () => users.filter((user) => user.status === "active").length,
    [users],
  );
  const pendingInvites = useMemo(
    () => invites.filter((invite) => invite.status === "pending").length,
    [invites],
  );

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });
    setCopied(false);

    const response = await fetch("/api/members/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const payload = (await response.json()) as {
      inviteUrl?: string;
      error?: string;
    };

    if (!response.ok || !payload.inviteUrl) {
      setState({
        status: "error",
        message: payload.error ?? "초대 생성에 실패했습니다.",
      });
      return;
    }

    setEmail("");
    setRole("member");
    setState({
      status: "success",
      message: "초대 링크를 생성했습니다.",
      inviteUrl: payload.inviteUrl,
    });
    router.refresh();
  }

  async function updateMember(
    id: string,
    patch: { role?: UserRole; status?: UserStatus },
  ) {
    setState({ status: "loading", inviteUrl: state.inviteUrl });

    const response = await fetch(`/api/members/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "회원 변경에 실패했습니다.",
        inviteUrl: state.inviteUrl,
      });
      return;
    }

    setState({
      status: "success",
      message: "회원 정보를 변경했습니다.",
      inviteUrl: state.inviteUrl,
    });
    router.refresh();
  }

  async function cancelInvite(id: string) {
    setState({ status: "loading", inviteUrl: state.inviteUrl });

    const response = await fetch(
      `/api/members/invites/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      },
    );
    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "초대 취소에 실패했습니다.",
        inviteUrl: state.inviteUrl,
      });
      return;
    }

    setState({
      status: "success",
      message: "초대를 취소했습니다.",
      inviteUrl: state.inviteUrl,
    });
    router.refresh();
  }

  async function copyInviteUrl() {
    if (!state.inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <MemberStat label="전체 회원" value={`${users.length}`} />
        <MemberStat label="Active" value={`${activeUsers}`} />
        <MemberStat label="Pending 초대" value={`${pendingInvites}`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[14px] border border-[#ebebeb] bg-white">
          <div className="border-b border-[#ebebeb] px-5 py-4">
            <h2 className="text-xl font-semibold text-[#222222]">Members</h2>
            <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
              초대 가입한 사용자의 역할과 상태를 관리합니다.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f7f7f7] text-xs font-semibold text-[#6a6a6a]">
                <tr>
                  <th className="px-5 py-3">사용자</th>
                  <th className="px-5 py-3">역할</th>
                  <th className="px-5 py-3">상태</th>
                  <th className="px-5 py-3">최근 로그인</th>
                  <th className="px-5 py-3 text-right">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#222222]">
                        {user.name}
                      </p>
                      <p className="mt-1 text-xs text-[#6a6a6a]">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateMember(user.id, {
                            role: event.target.value as UserRole,
                          })
                        }
                        className="h-9 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222] outline-none focus:border-[#222222]"
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-5 py-4 text-[#6a6a6a]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={
                          user.id === currentUserId ||
                          state.status === "loading"
                        }
                        onClick={() =>
                          updateMember(user.id, {
                            status:
                              user.status === "active" ? "inactive" : "active",
                          })
                        }
                        className="inline-flex h-9 items-center justify-center rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222] disabled:cursor-not-allowed disabled:text-[#929292]"
                      >
                        {user.status === "active" ? "비활성화" : "활성화"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="grid gap-4">
          <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff385c] text-white">
                <UserPlus size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[#222222]">
                  초대 생성
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
                  링크를 만든 뒤 직접 전달하세요. 자동 이메일은 MVP에서 제외합니다.
                </p>
              </div>
            </div>

            <form onSubmit={createInvite} className="mt-5 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#3f3f3f]">
                  이메일
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-14 rounded-[8px] border border-[#dddddd] px-3 text-base outline-none transition focus:border-2 focus:border-[#222222]"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[#3f3f3f]">역할</span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as UserRole)}
                  className="h-14 rounded-[8px] border border-[#dddddd] bg-white px-3 text-base outline-none transition focus:border-2 focus:border-[#222222]"
                >
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={state.status === "loading"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#ff385c] px-6 text-base font-medium text-white transition hover:bg-[#e00b41] disabled:cursor-not-allowed disabled:bg-[#ffd1da]"
              >
                {state.status === "loading" ? (
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus size={17} aria-hidden="true" />
                )}
                초대 링크 생성
              </button>
            </form>

            {state.message ? (
              <p
                className={[
                  "mt-4 rounded-[8px] px-3 py-2 text-sm leading-6",
                  state.status === "error"
                    ? "bg-[#fff1ed] text-[#c13515]"
                    : "bg-[#f7f7f7] text-[#3f3f3f]",
                ].join(" ")}
              >
                {state.message}
              </p>
            ) : null}

            {state.inviteUrl ? (
              <div className="mt-4 rounded-[8px] border border-[#dddddd] p-3">
                <p className="break-all text-xs leading-5 text-[#3f3f3f]">
                  {state.inviteUrl}
                </p>
                <button
                  type="button"
                  onClick={copyInviteUrl}
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] px-3 text-xs font-semibold text-[#222222]"
                >
                  {copied ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <Copy size={14} aria-hidden="true" />
                  )}
                  {copied ? "복사됨" : "링크 복사"}
                </button>
              </div>
            ) : null}
          </section>

          <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
            <h2 className="text-xl font-semibold text-[#222222]">Invites</h2>
            <div className="mt-4 grid gap-3">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-[10px] border border-[#ebebeb] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#222222]">
                          {invite.email}
                        </p>
                        <p className="mt-1 text-xs text-[#6a6a6a]">
                          만료{" "}
                          {new Date(invite.expiresAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                      </div>
                      <StatusBadge status={invite.status} />
                    </div>
                    {invite.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => cancelInvite(invite.id)}
                        className="mt-3 text-xs font-semibold text-[#c13515] underline underline-offset-4"
                      >
                        초대 취소
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-[10px] bg-[#f7f7f7] p-3 text-sm leading-6 text-[#6a6a6a]">
                  아직 생성된 초대가 없습니다.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

function MemberStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
      <p className="text-sm font-medium text-[#6a6a6a]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#222222]">{value}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === "active" || status === "pending";

  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold",
        active
          ? "bg-[#ff385c]/10 text-[#c13515]"
          : "bg-[#f7f7f7] text-[#6a6a6a]",
      ].join(" ")}
    >
      {status}
    </span>
  );
}
