import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <section className="w-full max-w-[440px]">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#ff385c] text-white">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold leading-tight text-[#222222]">
              Channel Essence
            </span>
            <span className="block text-sm text-[#6a6a6a]">
              잠들기전 교양이 Research
            </span>
          </span>
        </Link>

        <div className="mt-8 rounded-[14px] border border-[#dddddd] bg-white p-6 shadow-[rgba(0,0,0,0.02)_0_0_0_1px,rgba(0,0,0,0.04)_0_2px_6px,rgba(0,0,0,0.1)_0_4px_8px]">
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#222222]">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#3f3f3f]">
            {description}
          </p>
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <div className="mt-5 text-center text-sm leading-6 text-[#6a6a6a]">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export function AuthNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#dddddd] bg-[#f7f7f7] p-4">
      <p className="text-sm font-semibold text-[#222222]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#3f3f3f]">{description}</p>
    </div>
  );
}
