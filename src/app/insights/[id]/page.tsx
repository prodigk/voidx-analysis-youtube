import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, Users, Video } from "lucide-react";
import { getSavedAnalysis } from "@/lib/analysis-store";
import { toAnalysisBoardItem } from "@/lib/analysis-presenter";
import { AnalysisResultCard } from "@/components/analysis-result-card";
import { Section } from "@/components/ui-blocks";

export const dynamic = "force-dynamic";

export default async function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const analysis = await getSavedAnalysis(decodeURIComponent(id));

  if (!analysis) {
    notFound();
  }

  const item = toAnalysisBoardItem(analysis);

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3f3f3f] hover:text-[#222222]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Insight Board로 돌아가기
        </Link>
      </div>

      <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <ReportThumbnail
              title={item.channelName}
              thumbnailUrl={item.thumbnailUrl}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-8 items-center rounded-full bg-[#ff385c]/10 px-3 text-xs font-semibold text-[#c13515]">
                  {item.typeLabel}
                </span>
                <span className="inline-flex h-8 items-center gap-1 rounded-full border border-[#dddddd] px-3 text-xs font-semibold text-[#6a6a6a]">
                  <CalendarDays size={14} aria-hidden="true" />
                  {item.createdLabel}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-semibold leading-tight text-[#222222] sm:text-[32px]">
                {item.title}
              </h1>
              <p className="mt-3 text-sm font-semibold text-[#3f3f3f]">
                {item.channelName}
                {item.channelHandle ? (
                  <span className="font-medium text-[#6a6a6a]">
                    {" "}
                    · {item.channelHandle}
                  </span>
                ) : null}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#3f3f3f]">
                {item.summary}
              </p>
            </div>
          </div>

          <dl className="grid min-w-full grid-cols-3 gap-2 text-xs sm:min-w-[360px]">
            <Metric
              icon={<Users size={15} aria-hidden="true" />}
              label="구독자"
              value={item.subscriberLabel}
            />
            <Metric
              icon={<Video size={15} aria-hidden="true" />}
              label="영상"
              value={item.videoCountLabel}
            />
            <Metric
              icon={<Eye size={15} aria-hidden="true" />}
              label="조회수"
              value={item.viewCountLabel}
            />
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#ebebeb] pt-4">
          <span className="inline-flex h-8 items-center rounded-full bg-[#f7f7f7] px-3 text-xs font-semibold text-[#3f3f3f]">
            주제: {item.topic}
          </span>
          <span className="inline-flex h-8 items-center rounded-full bg-[#f7f7f7] px-3 text-xs font-semibold text-[#3f3f3f]">
            소스: {item.sourceLabel}
          </span>
          {item.channelCount > 1 ? (
            <span className="inline-flex h-8 items-center rounded-full bg-[#f7f7f7] px-3 text-xs font-semibold text-[#3f3f3f]">
              비교 채널 {item.channelCount}개
            </span>
          ) : null}
        </div>
      </section>

      <Section title="Report Detail">
        <AnalysisResultCard analysis={analysis} />
      </Section>
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
      <div className="size-20 shrink-0 overflow-hidden rounded-[14px] bg-[#f7f7f7] sm:size-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnailUrl} alt="" className="size-full object-cover" />
      </div>
    );
  }

  return (
    <div className="flex size-20 shrink-0 items-center justify-center rounded-[14px] bg-[#222222] text-xl font-semibold text-white sm:size-24">
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
    <div className="min-w-0 rounded-[10px] bg-[#f7f7f7] px-3 py-3">
      <dt className="flex items-center gap-1 text-[#6a6a6a]">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-[#222222]">
        {value}
      </dd>
    </div>
  );
}
