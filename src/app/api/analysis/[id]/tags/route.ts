import { NextResponse } from "next/server";
import { updateAnalysisTags } from "@/lib/analysis-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { tags?: string[] };
    const analysis = await updateAnalysisTags(
      decodeURIComponent(id),
      Array.isArray(body.tags) ? body.tags : [],
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "태그 저장에 실패했습니다.",
      },
      { status: 400 },
    );
  }
}
