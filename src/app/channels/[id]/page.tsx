import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getSavedAnalyses } from "@/lib/analysis-store";
import { requirePageUser } from "@/lib/auth";
import { AnalysisResultCard } from "@/components/analysis-result-card";
import { EmptyState, PageHeader, Section } from "@/components/ui-blocks";
import { YouTubeRefreshPanel } from "@/components/youtube-refresh-panel";

export const dynamic = "force-dynamic";

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageUser();

  const { id } = await params;
  const identifier = decodeURIComponent(id);
  const analyses = (await getSavedAnalyses()).filter(
    (analysis) => analysis.input.channelRefresh?.channel.id === identifier,
  );

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/channels"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3f3f3f] hover:text-[#222222]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Channels로 돌아가기
        </Link>
      </div>

      <PageHeader
        eyebrow="Channel Detail"
        title="채널 분석 페이지"
        description="저장된 분석 데이터가 없으면 데이터 없음 상태만 표시합니다. 아래에서 채널 데이터를 새로고침하세요."
        action={{ href: "/strategy", label: "전략 화면 보기" }}
      />

      <YouTubeRefreshPanel defaultIdentifier={identifier} />

      <Section title="Stored Analysis">
        {analyses.length > 0 ? (
          <div className="grid gap-5">
            {analyses.map((analysis) => (
              <AnalysisResultCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        ) : (
          <EmptyState description="이 채널에 저장된 실제 분석 데이터가 없습니다." />
        )}
      </Section>
    </div>
  );
}
