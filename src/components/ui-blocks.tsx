import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-5 border-b border-[#dddddd] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#222222] sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-[#3f3f3f]">
          {description}
        </p>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#ff385c] px-5 text-sm font-semibold text-white transition hover:bg-[#e00b41]"
        >
          {action.label}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      ) : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
      <p className="text-sm font-medium text-[#6a6a6a]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-normal text-[#222222]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">{detail}</p>
    </article>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#222222]">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  title = "데이터 없음",
  description = "아직 불러온 실제 데이터가 없습니다.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#dddddd] bg-white p-6 text-center">
      <p className="text-sm font-semibold text-[#222222]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">{description}</p>
    </div>
  );
}

export function InsightList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[14px] border border-[#ebebeb] bg-white px-4 py-3 text-sm leading-6 text-[#3f3f3f]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ApplicationPanel({ items }: { items: string[] }) {
  return (
    <div className="rounded-[14px] border border-[#ff385c]/25 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
        잠들기전 교양이 적용 포인트
      </p>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-[#3f3f3f]">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ff385c]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DataBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#3f3f3f]">
      {children}
    </span>
  );
}

export function DetailLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] underline decoration-[#ff385c] decoration-2 underline-offset-4 transition hover:text-[#e00b41]"
    >
      {children}
      <ExternalLink size={15} aria-hidden="true" />
    </Link>
  );
}
