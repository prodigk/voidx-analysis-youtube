import { NextResponse } from "next/server";
import type { AnalysisInput, AnalysisType, SavedAnalysis } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";
import { saveAnalysis } from "@/lib/analysis-store";
import { requireApiUser } from "@/lib/auth";
import { generateAnalysis, getSourceLabel } from "@/lib/openai-analysis";

const analysisTypes = new Set<AnalysisType>([
  "channel_analysis",
  "category_insight",
  "channel_comparison",
  "sleep_culture_strategy",
  "video_ideas",
]);

export async function POST(request: Request) {
  try {
    const { response } = await requireApiUser();

    if (response) {
      return response;
    }

    const body = (await request.json()) as {
      type?: AnalysisType;
      input?: AnalysisInput;
    };

    if (!body.type || !analysisTypes.has(body.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 분석 유형입니다." },
        { status: 400 },
      );
    }

    const input = body.input ?? {};
    const result = await generateAnalysis(body.type, input);
    const sourceLabel = getSourceLabel(body.type, input);
    const analysis: SavedAnalysis = {
      id: `${Date.now()}-${crypto.randomUUID()}`,
      type: body.type,
      title: result.title || analysisTypeLabels[body.type],
      sourceLabel,
      createdAt: new Date().toISOString(),
      input,
      result,
    };

    await saveAnalysis(analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI 분석 생성에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
