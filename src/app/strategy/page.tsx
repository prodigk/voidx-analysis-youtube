import { StrategyGenerator } from "@/components/strategy-generator";
import { PageHeader } from "@/components/ui-blocks";

export default function StrategyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Strategy Generator"
        title="분석 패턴을 영상 기획안으로 바꾸기"
        description="실제 분석 데이터가 없으면 데이터 없음 상태만 표시합니다. 이후 AI 분석 결과가 연결되면 실제 전략 결과를 생성합니다."
      />
      <StrategyGenerator />
    </div>
  );
}
