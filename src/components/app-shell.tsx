"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Compass,
  FlaskConical,
  Gauge,
  Lightbulb,
  LogOut,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/categories", label: "Category Explorer", icon: Compass },
  { href: "/channels", label: "Channels", icon: BarChart3 },
  { href: "/insights", label: "Insight Board", icon: Lightbulb },
  { href: "/strategy", label: "Strategy Generator", icon: FlaskConical },
  { href: "/members", label: "Members", icon: Users, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  currentUser,
}: {
  children: ReactNode;
  currentUser: AuthUser | null;
}) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/logout");

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-white text-[#222222]">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#222222]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col lg:flex-row">
        <aside className="border-b border-[#dddddd] bg-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col gap-6 px-5 py-5 lg:px-6 lg:py-7">
            <Link href="/" className="group flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#ff385c] text-white shadow-sm shadow-[#ff385c]/20">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-semibold leading-tight">
                  Channel Essence
                </span>
                <span className="block text-sm text-[#6a6a6a]">
                  잠들기전 교양이 Research
                </span>
              </span>
            </Link>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {navItems
                .filter(
                  (item) => !item.adminOnly || currentUser?.role === "admin",
                )
                .map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-sm font-medium transition",
                        isActive
                          ? "bg-[#222222] text-white"
                          : "text-[#3f3f3f] hover:bg-[#f2f2f2] hover:text-[#222222]",
                      ].join(" ")}
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </nav>

            <div className="mt-auto hidden rounded-[14px] border border-[#ebebeb] bg-[#f7f7f7] p-4 lg:block">
              {currentUser ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6a6a6a]">
                    Signed in
                  </p>
                  <p className="mt-2 truncate text-sm font-semibold text-[#222222]">
                    {currentUser.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#6a6a6a]">
                    {currentUser.email}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex h-7 items-center rounded-full bg-white px-2.5 text-xs font-semibold text-[#3f3f3f]">
                      {currentUser.role}
                    </span>
                    <a
                      href="/logout"
                      className="inline-flex size-8 items-center justify-center rounded-full bg-white text-[#222222] transition hover:bg-[#f2f2f2]"
                      aria-label="로그아웃"
                    >
                      <LogOut size={15} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[#6a6a6a]">
                    MVP 5
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#3f3f3f]">
                    회원 기능은 DATABASE_URL이 설정된 환경에서 활성화됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
