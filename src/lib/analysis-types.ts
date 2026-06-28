import type { YouTubeChannelCandidate, YouTubeRefreshResult } from "@/lib/youtube";

export type AnalysisType =
  | "channel_analysis"
  | "category_insight"
  | "channel_comparison"
  | "sleep_culture_strategy"
  | "video_ideas";

export type AnalysisInput = {
  categoryName?: string;
  channelRefresh?: YouTubeRefreshResult;
  channels?: YouTubeChannelCandidate[];
  topic?: string;
  book?: string;
  tone?: string;
  audience?: string;
};

export type AnalysisResult = {
  title: string;
  summary: string;
  sections: {
    title: string;
    points: string[];
  }[];
  recommendations: string[];
  sleepCultureApplications: string[];
  videoIdeas: {
    title: string;
    hook: string;
    outline: string[];
  }[];
  nextActions: string[];
};

export type SavedAnalysis = {
  id: string;
  type: AnalysisType;
  title: string;
  sourceLabel: string;
  createdAt: string;
  tags?: string[];
  input: AnalysisInput;
  result: AnalysisResult;
};

export const analysisTypeLabels: Record<AnalysisType, string> = {
  channel_analysis: "채널 분석",
  category_insight: "카테고리 인사이트",
  channel_comparison: "채널 비교 분석",
  sleep_culture_strategy: "잠들기전 교양이 적용 전략",
  video_ideas: "영상 아이디어",
};
