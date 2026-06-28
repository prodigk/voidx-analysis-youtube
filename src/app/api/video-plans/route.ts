import { NextResponse } from "next/server";
import { getVideoPlans, saveVideoPlan } from "@/lib/app-store";
import type { TitleCandidate } from "@/lib/app-store-types";

export async function GET() {
  const plans = await getVideoPlans();

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      categoryName?: string;
      topic?: string;
      book?: string;
      tone?: string;
      audience?: string;
      thumbnailMemo?: string;
      titleCandidates?: TitleCandidate[];
    };

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "기획안 제목을 입력하세요." },
        { status: 400 },
      );
    }

    const plan = await saveVideoPlan({
      title: body.title.trim(),
      categoryName: body.categoryName?.trim() || "미분류",
      topic: body.topic?.trim() ?? "",
      book: body.book?.trim() ?? "",
      tone: body.tone?.trim() ?? "",
      audience: body.audience?.trim() ?? "",
      thumbnailMemo: body.thumbnailMemo?.trim() ?? "",
      titleCandidates: (body.titleCandidates ?? [])
        .filter((candidate) => candidate.title.trim())
        .map((candidate) => ({
          id: candidate.id || crypto.randomUUID(),
          title: candidate.title.trim(),
          score: Math.min(Math.max(Number(candidate.score) || 1, 1), 5),
          memo: candidate.memo.trim(),
        })),
    });

    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "영상 기획안 저장에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
