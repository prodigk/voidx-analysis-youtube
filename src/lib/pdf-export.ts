import "server-only";

import { existsSync } from "node:fs";
import PDFDocument from "pdfkit";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { analysisTypeLabels } from "@/lib/analysis-types";

const fontCandidates = [
  process.env.PDF_KOREAN_FONT_PATH,
  "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
  "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttf",
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.otf",
].filter(Boolean) as string[];

function writeBullets(doc: PDFKit.PDFDocument, items: string[]) {
  if (!items.length) {
    doc.text("• 없음", { indent: 12 });
    return;
  }

  items.forEach((item) => {
    doc.text(`• ${item}`, { indent: 12 });
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(1).fontSize(15).fillColor("#222222").text(title);
  doc.moveDown(0.3).fontSize(10).fillColor("#3f3f3f");
}

export async function analysisToPdfBuffer(analysis: SavedAnalysis) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    info: {
      Title: analysis.title,
      Author: "Channel Essence",
      Subject: analysisTypeLabels[analysis.type],
    },
  });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const fontPath = fontCandidates.find((candidate) => existsSync(candidate));

  if (fontPath) {
    doc.font(fontPath);
  }

  doc
    .fontSize(20)
    .fillColor("#222222")
    .text(analysis.result.title, { lineGap: 4 });
  doc.moveDown(0.6);
  doc
    .fontSize(10)
    .fillColor("#6a6a6a")
    .text(`${analysisTypeLabels[analysis.type]} · ${analysis.sourceLabel}`);
  doc.text(
    new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(analysis.createdAt)),
  );

  if (analysis.tags?.length) {
    doc.text(`태그: ${analysis.tags.join(", ")}`);
  }

  sectionTitle(doc, "요약");
  doc.text(analysis.result.summary, { lineGap: 3 });

  analysis.result.sections.forEach((section) => {
    sectionTitle(doc, section.title);
    writeBullets(doc, section.points);
  });

  sectionTitle(doc, "추천 전략");
  writeBullets(doc, analysis.result.recommendations);

  sectionTitle(doc, "잠들기전 교양이 적용");
  writeBullets(doc, analysis.result.sleepCultureApplications);

  if (analysis.result.videoIdeas.length) {
    sectionTitle(doc, "영상 아이디어");
    analysis.result.videoIdeas.forEach((idea, index) => {
      doc
        .moveDown(0.4)
        .fontSize(11)
        .fillColor("#222222")
        .text(`${index + 1}. ${idea.title}`);
      doc.fontSize(10).fillColor("#3f3f3f").text(`Hook: ${idea.hook}`);
      writeBullets(doc, idea.outline);
    });
  }

  sectionTitle(doc, "다음 액션");
  writeBullets(doc, analysis.result.nextActions);

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
