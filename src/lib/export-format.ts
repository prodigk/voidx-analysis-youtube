import type { SavedAnalysis } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- 없음";
}

export function getAnalysisFilename(analysis: SavedAnalysis, extension: string) {
  const safeTitle = analysis.title
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  return `${safeTitle || "analysis-report"}.${extension}`;
}

export function analysisToMarkdown(analysis: SavedAnalysis) {
  const lines = [
    `# ${analysis.result.title}`,
    "",
    `- 유형: ${analysisTypeLabels[analysis.type]}`,
    `- 출처: ${analysis.sourceLabel}`,
    `- 생성일: ${new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(analysis.createdAt))}`,
  ];

  if (analysis.tags?.length) {
    lines.push(`- 태그: ${analysis.tags.join(", ")}`);
  }

  lines.push("", "## 요약", "", analysis.result.summary);

  analysis.result.sections.forEach((section) => {
    lines.push("", `## ${section.title}`, "", list(section.points));
  });

  lines.push("", "## 추천 전략", "", list(analysis.result.recommendations));
  lines.push(
    "",
    "## 잠들기전 교양이 적용",
    "",
    list(analysis.result.sleepCultureApplications),
  );

  if (analysis.result.videoIdeas.length) {
    lines.push("", "## 영상 아이디어");
    analysis.result.videoIdeas.forEach((idea, index) => {
      lines.push(
        "",
        `### ${index + 1}. ${idea.title}`,
        "",
        `- Hook: ${idea.hook}`,
        "- Outline:",
        ...idea.outline.map((step) => `  - ${step}`),
      );
    });
  }

  lines.push("", "## 다음 액션", "", list(analysis.result.nextActions), "");

  return lines.join("\n");
}
