import { categories } from "@/lib/categories";
import { getSavedAnalyses } from "@/lib/analysis-store";
import { getSavedChannels, getVideoPlans } from "@/lib/app-store";
import { EmptyState, PageHeader, Section, StatCard } from "@/components/ui-blocks";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [analyses, channels, videoPlans] = await Promise.all([
    getSavedAnalyses(),
    getSavedChannels(),
    getVideoPlans(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="실제 YouTube 데이터로 채널을 확인하는 리서치 보드"
        description="YouTube API로 데이터를 불러오고 OpenAI API로 채널 분석, 카테고리 인사이트, 적용 전략, 영상 아이디어를 생성합니다."
        action={{ href: "/categories", label: "카테고리 검색" }}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="검색 카테고리"
          value={`${categories.length}`}
          detail="YouTube 후보 검색용 preset"
        />
        <StatCard
          label="저장된 채널"
          value={`${channels.length}`}
          detail={`${channels.filter((channel) => channel.favorite).length}개 즐겨찾기`}
        />
        <StatCard
          label="저장된 분석"
          value={`${analyses.length}`}
          detail="AI 생성 결과"
        />
        <StatCard
          label="영상 기획안"
          value={`${videoPlans.length}`}
          detail="저장된 제목 후보/썸네일 메모"
        />
      </section>

      <Section
        title="Channel Snapshot"
        description="저장된 실제 채널 데이터가 있을 때 이 영역에 표시됩니다."
      >
        {channels.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {channels.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="rounded-[14px] border border-[#ebebeb] bg-white p-4"
              >
                <p className="truncate text-sm font-semibold text-[#222222]">
                  {item.channel.title}
                </p>
                <p className="mt-2 text-xs text-[#6a6a6a]">
                  {item.favorite ? "즐겨찾기 · " : ""}
                  {item.channel.handle}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState description="아직 저장된 채널이 없습니다. Category Explorer에서 실제 YouTube 후보 채널을 검색하세요." />
        )}
      </Section>

      <Section
        title="Recent Analysis"
        description="AI 분석 또는 저장된 리서치 결과가 있을 때만 표시됩니다."
      >
        {analyses.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {analyses.slice(0, 3).map((analysis) => (
              <article
                key={analysis.id}
                className="rounded-[14px] border border-[#ebebeb] bg-white p-4"
              >
                <p className="text-sm font-semibold text-[#222222]">
                  {analysis.title}
                </p>
                <p className="mt-2 text-xs text-[#6a6a6a]">
                  {analysis.sourceLabel}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState description="아직 불러온 분석 데이터가 없습니다." />
        )}
      </Section>
    </div>
  );
}
