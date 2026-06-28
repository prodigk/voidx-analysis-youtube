import "server-only";

import type { AnalysisInput, AnalysisResult, AnalysisType } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.5";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "points"],
      },
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
    },
    sleepCultureApplications: {
      type: "array",
      items: { type: "string" },
    },
    videoIdeas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          hook: { type: "string" },
          outline: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "hook", "outline"],
      },
    },
    nextActions: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "title",
    "summary",
    "sections",
    "recommendations",
    "sleepCultureApplications",
    "videoIdeas",
    "nextActions",
  ],
};

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  return key;
}

function getModel() {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

function buildInstructions(type: AnalysisType) {
  return [
    "You are a YouTube channel strategy analyst for the Korean channel '잠들기전 교양이'.",
    "Write in Korean.",
    "Use a calm, practical, strategy-focused tone.",
    "Separate observation from recommendation where useful.",
    "Do not invent exact data that is not present in the input.",
    "If data is insufficient, say what is missing and still provide cautious next steps.",
    `Current task: ${analysisTypeLabels[type]}.`,
  ].join("\n");
}

function compactInput(input: AnalysisInput) {
  const refresh = input.channelRefresh;

  return {
    categoryName: input.categoryName,
    topic: input.topic,
    book: input.book,
    tone: input.tone,
    audience: input.audience,
    channel: refresh
      ? {
          title: refresh.channel.title,
          handle: refresh.channel.handle,
          subscribers: refresh.channel.subscribers,
          totalViews: refresh.channel.totalViews,
          videoCount: refresh.channel.videoCount,
          averageRecentViews: refresh.averageRecentViews,
          recentVideos: refresh.recentVideos.slice(0, 8).map((video) => ({
            title: video.title,
            views: video.views,
            duration: video.duration,
            publishedAt: video.publishedAt,
          })),
          popularVideos: refresh.popularVideos.slice(0, 8).map((video) => ({
            title: video.title,
            views: video.views,
            duration: video.duration,
            publishedAt: video.publishedAt,
          })),
        }
      : undefined,
    channels: input.channels?.slice(0, 10).map((channel, index) => ({
      rankBySubscribers: index + 1,
      title: channel.title,
      handle: channel.handle,
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel.videoCount,
      description: channel.description.slice(0, 500),
    })),
  };
}

function buildPrompt(type: AnalysisType, input: AnalysisInput) {
  const label = analysisTypeLabels[type];

  return [
    `${label}을 생성하세요.`,
    "반드시 주어진 JSON 입력만 근거로 분석하세요.",
    "잠들기전 교양이는 책, 철학, 문화, 심리, 자기계발, 커리어, IT를 차분하게 엮는 지식 채널입니다.",
    "결과는 전략 보드에 바로 붙일 수 있게 구체적으로 작성하세요.",
    JSON.stringify(compactInput(input), null, 2),
  ].join("\n\n");
}

function extractOutputText(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  const output = (payload as { output?: unknown[] }).output;

  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      const content = (item as { content?: unknown[] }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      if (
        typeof content === "object" &&
        content !== null &&
        "text" in content &&
        typeof content.text === "string"
      ) {
        return content.text;
      }

      return "";
    })
    .join("");
}

export async function generateAnalysis(type: AnalysisType, input: AnalysisInput) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      reasoning: { effort: "low" },
      instructions: buildInstructions(type),
      input: buildPrompt(type, input),
      text: {
        format: {
          type: "json_schema",
          name: "youtube_strategy_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message ?? "OpenAI API 분석 생성에 실패했습니다.";
    throw new Error(message);
  }

  const text = extractOutputText(payload);

  if (!text) {
    throw new Error("OpenAI API 응답에서 분석 결과를 찾지 못했습니다.");
  }

  return JSON.parse(text) as AnalysisResult;
}

export function getSourceLabel(type: AnalysisType, input: AnalysisInput) {
  if (input.channelRefresh?.channel.title) {
    return input.channelRefresh.channel.title;
  }

  if (input.categoryName) {
    return input.categoryName;
  }

  if (input.topic) {
    return input.topic;
  }

  return analysisTypeLabels[type];
}
