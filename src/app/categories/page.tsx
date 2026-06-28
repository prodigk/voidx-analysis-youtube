import { CategoryExplorer } from "@/components/category-explorer";
import { PageHeader } from "@/components/ui-blocks";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Category Explorer"
        title="카테고리별 실제 YouTube 후보 채널 검색"
        description="카테고리 preset과 검색어를 바탕으로 YouTube API에서 실제 후보 채널을 불러옵니다. 저장된 데이터가 없으면 데이터 없음 상태만 표시합니다."
      />
      <CategoryExplorer />
    </div>
  );
}
