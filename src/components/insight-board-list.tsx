import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  FileText,
  Users,
  Video,
} from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { toAnalysisBoardItem } from "@/lib/analysis-presenter";

export function InsightBoardList({
  analyses,
}: {
  analyses: SavedAnalysis[];
}) {
  const items = analyses.map(toAnalysisBoardItem);

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#ebebeb] bg-white">
      <div className="hidden grid-cols-[minmax(360px,1.6fr)_minmax(150px,0.7fr)_minmax(270px,1fr)_92px] gap-4 border-b border-[#ebebeb] bg-[#f7f7f7] px-5 py-3 text-xs font-bold text-[#6a6a6a] lg:grid">
        <span>리포트</span>
        <span>주제</span>
        <span>채널 지표</span>
        <span className="text-right">뷰</span>
      </div>

      <div className="divide-y divide-[#ebebeb]">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/insights/${encodeURIComponent(item.id)}`}
            className="group grid gap-4 px-4 py-4 transition hover:bg-[#fff8f6] sm:px-5 lg:grid-cols-[minmax(360px,1.6fr)_minmax(150px,0.7fr)_minmax(270px,1fr)_92px] lg:items-center"
          >
            <div className="flex min-w-0 gap-4">
              <ReportThumbnail
                title={item.channelName}
                thumbnailUrl={item.thumbnailUrl}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-7 items-center rounded-full bg-[#ff385c]/10 px-2.5 text-xs font-semibold text-[#c13515]">
                    {item.typeLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6a6a6a]">
                    <CalendarDays size={13} aria-hidden="true" />
                    {item.createdLabel}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-[#222222] group-hover:text-[#c13515]">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-[#3f3f3f]">
                  {item.channelName}
                </p>
                {item.channelHandle ? (
                  <p className="mt-0.5 truncate text-xs text-[#6a6a6a]">
                    {item.channelHandle}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#6a6a6a] lg:hidden">주제</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#222222] lg:mt-0">
                {item.topic}
              </p>
              {item.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex h-6 items-center rounded-full border border-[#dddddd] px-2 text-[11px] font-semibold text-[#6a6a6a]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <dl className="grid grid-cols-3 gap-2 text-xs">
              <Metric
                icon={<Users size={14} aria-hidden="true" />}
                label="구독자"
                value={item.subscriberLabel}
              />
              <Metric
                icon={<Video size={14} aria-hidden="true" />}
                label="영상"
                value={item.videoCountLabel}
              />
              <Metric
                icon={<Eye size={14} aria-hidden="true" />}
                label="조회수"
                value={item.viewCountLabel}
              />
            </dl>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <span className="line-clamp-1 text-xs leading-5 text-[#6a6a6a] lg:hidden">
                {item.summary}
              </span>
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#dddddd] text-[#222222] transition group-hover:border-[#ff385c] group-hover:bg-[#ff385c] group-hover:text-white">
                <ArrowRight size={16} aria-hidden="true" />
                <span className="sr-only">상세 보기</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReportThumbnail({
  title,
  thumbnailUrl,
}: {
  title: string;
  thumbnailUrl: string;
}) {
  if (thumbnailUrl) {
    return (
      <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[12px] bg-[#f7f7f7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="size-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-white/95 text-[#c13515] shadow-sm">
          <FileText size={13} aria-hidden="true" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex size-[72px] shrink-0 items-center justify-center rounded-[12px] bg-[#222222] text-lg font-semibold text-white">
      {title.trim().slice(0, 1) || "I"}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[10px] bg-[#f7f7f7] px-2.5 py-2">
      <dt className="flex items-center gap-1 text-[#6a6a6a]">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="mt-1 truncate font-semibold text-[#222222]">{value}</dd>
    </div>
  );
}
