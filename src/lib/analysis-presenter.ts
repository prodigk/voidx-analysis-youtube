import type { AnalysisType, SavedAnalysis } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { formatCompactNumber, formatDate } from "@/lib/format";
import type { YouTubeChannelStats } from "@/lib/youtube";

type BoardChannel = Pick<
  YouTubeChannelStats,
  | "title"
  | "handle"
  | "thumbnailUrl"
  | "subscribers"
  | "totalViews"
  | "videoCount"
>;

export type AnalysisBoardItem = {
  id: string;
  title: string;
  type: AnalysisType;
  typeLabel: string;
  sourceLabel: string;
  channelName: string;
  channelHandle: string;
  channelCount: number;
  thumbnailUrl: string;
  topic: string;
  subscriberLabel: string;
  viewCountLabel: string;
  videoCountLabel: string;
  createdLabel: string;
  summary: string;
  tags: string[];
};

export function toAnalysisBoardItem(analysis: SavedAnalysis): AnalysisBoardItem {
  const channels = getAnalysisChannels(analysis);
  const firstChannel = channels[0];

  return {
    id: analysis.id,
    title: analysis.title,
    type: analysis.type,
    typeLabel: analysisTypeLabels[analysis.type],
    sourceLabel: analysis.sourceLabel,
    channelName: getChannelName(analysis, channels),
    channelHandle: firstChannel?.handle ?? "",
    channelCount: channels.length,
    thumbnailUrl: firstChannel?.thumbnailUrl ?? "",
    topic: getTopicLabel(analysis),
    subscriberLabel: getSubscriberLabel(channels),
    viewCountLabel: getSummedMetric(channels, "totalViews"),
    videoCountLabel: getSummedMetric(channels, "videoCount", false),
    createdLabel: formatDate(analysis.createdAt),
    summary: analysis.result.summary,
    tags: analysis.tags ?? [],
  };
}

export function getAnalysisChannels(analysis: SavedAnalysis): BoardChannel[] {
  if (analysis.input.channelRefresh?.channel) {
    return [analysis.input.channelRefresh.channel];
  }

  return analysis.input.channels ?? [];
}

function getChannelName(analysis: SavedAnalysis, channels: BoardChannel[]) {
  if (channels.length === 0) {
    return analysis.sourceLabel;
  }

  if (channels.length === 1) {
    return channels[0].title;
  }

  return `${channels[0].title} 외 ${channels.length - 1}개`;
}

function getTopicLabel(analysis: SavedAnalysis) {
  if (analysis.input.categoryName) {
    return analysis.input.categoryName;
  }

  if (analysis.input.topic) {
    return analysis.input.topic;
  }

  if (analysis.input.book) {
    return analysis.input.book;
  }

  return analysisTypeLabels[analysis.type];
}

function getSubscriberLabel(channels: BoardChannel[]) {
  if (channels.length === 0) {
    return "-";
  }

  const subscriberCounts = channels
    .map((channel) => channel.subscribers)
    .filter((value): value is number => value !== null);

  if (subscriberCounts.length === 0) {
    return "비공개";
  }

  const total = subscriberCounts.reduce((sum, value) => sum + value, 0);
  const label = formatCompactNumber(total);

  return channels.length > 1 ? `${label} 합산` : label;
}

function getSummedMetric(
  channels: BoardChannel[],
  key: "totalViews" | "videoCount",
  compact = true,
) {
  if (channels.length === 0) {
    return "-";
  }

  const total = channels.reduce((sum, channel) => sum + channel[key], 0);

  if (compact) {
    return channels.length > 1
      ? `${formatCompactNumber(total)} 합산`
      : formatCompactNumber(total);
  }

  const label = total.toLocaleString("ko-KR");

  return channels.length > 1 ? `${label} 합산` : label;
}
