import { getSavedAnalyses } from "@/lib/analysis-store";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { AnalysisResultCard } from "@/components/analysis-result-card";
import { EmptyState, PageHeader, Section, StatCard } from "@/components/ui-blocks";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
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
        title="저장된 AI 분석 결과"
        description="채널 분석, 카테고리 인사이트, 비교 분석, 적용 전략, 영상 아이디어 생성 결과를 저장된 순서대로 확인합니다."
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

      <Section title="Analysis Results">
        {analyses.length > 0 ? (
          <div className="grid gap-5">
            {analyses.map((analysis) => (
              <AnalysisResultCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        ) : (
          <EmptyState description="아직 저장된 AI 분석 결과가 없습니다." />
        )}
      </Section>
    </div>
  );
}
