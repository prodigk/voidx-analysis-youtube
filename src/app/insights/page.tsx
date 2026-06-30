import { getSavedAnalyses } from "@/lib/analysis-store";
import { requirePageUser } from "@/lib/auth";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { InsightBoardList } from "@/components/insight-board-list";
import { EmptyState, PageHeader, Section, StatCard } from "@/components/ui-blocks";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await requirePageUser();

  const analyses = await getSavedAnalyses();
  const counts = analyses.reduce(
    (acc, analysis) => {
      acc[analysis.type] = (acc[analysis.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Insight Board"
        title="분석 리포트 보드"
        description="저장된 AI 분석 결과를 게시판처럼 정리합니다. 썸네일, 채널 지표, 주제 기준으로 훑어보고 상세 리포트로 들어가세요."
        action={{ href: "/categories", label: "YouTube 데이터 검색" }}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(analysisTypeLabels).map(([type, label]) => (
          <StatCard
            key={type}
            label={label}
            value={`${counts[type] ?? 0}`}
            detail="저장된 결과"
          />
        ))}
      </section>

      <Section
        title="Report List"
        description="각 행을 누르면 해당 분석 리포트의 상세 내용을 볼 수 있습니다."
      >
        {analyses.length > 0 ? (
          <InsightBoardList analyses={analyses} />
        ) : (
          <EmptyState description="아직 저장된 AI 분석 결과가 없습니다." />
        )}
      </Section>
    </div>
  );
}
