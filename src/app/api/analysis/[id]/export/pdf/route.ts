import { NextResponse } from "next/server";
import { getSavedAnalysis } from "@/lib/analysis-store";
import { requireApiUser } from "@/lib/auth";
import { getAnalysisFilename } from "@/lib/export-format";
import { analysisToPdfBuffer } from "@/lib/pdf-export";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { response } = await requireApiUser();

  if (response) {
    return response;
  }

  const { id } = await params;
  const analysis = await getSavedAnalysis(decodeURIComponent(id));

  if (!analysis) {
    return NextResponse.json(
      { error: "저장된 분석 결과를 찾지 못했습니다." },
      { status: 404 },
    );
  }

  const pdf = await analysisToPdfBuffer(analysis);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(
        getAnalysisFilename(analysis, "pdf"),
      )}"`,
    },
  });
}
