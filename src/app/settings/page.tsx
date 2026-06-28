import { SettingsPanel } from "@/components/settings-panel";
import { PageHeader } from "@/components/ui-blocks";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Settings"
        title="데이터와 분석 프롬프트를 관리할 자리"
        description="YouTube API Key는 서버 환경변수로 관리합니다. 카테고리와 프롬프트 저장소는 다음 단계에서 실제 DB와 연결합니다."
      />
      <SettingsPanel />
    </div>
  );
}
