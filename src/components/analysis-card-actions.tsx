"use client";

import { useState } from "react";
import { Download, FileText, Tag } from "lucide-react";

export function AnalysisCardActions({
  analysisId,
  initialTags = [],
}: {
  analysisId: string;
  initialTags?: string[];
}) {
  const [tags, setTags] = useState(initialTags.join(", "));
  const [message, setMessage] = useState("");

  async function saveTags() {
    const nextTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const response = await fetch(
      `/api/analysis/${encodeURIComponent(analysisId)}/tags`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: nextTags }),
      },
    );
    const payload = (await response.json()) as { error?: string };

    setMessage(
      response.ok ? "태그 저장 완료" : payload.error ?? "태그 저장 실패",
    );
  }

  return (
    <div className="mt-5 grid gap-3 border-t border-[#ebebeb] pt-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-h-10 flex-1 items-center gap-2 rounded-[14px] border border-[#dddddd] px-3 py-2">
          <Tag size={15} className="text-[#6a6a6a]" aria-hidden="true" />
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="태그 입력: 예) 제목, 경쟁채널, 쇼츠"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#929292]"
          />
        </label>
        <button
          type="button"
          onClick={saveTags}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#222222] px-4 text-sm font-semibold text-white transition hover:bg-[#3f3f3f]"
        >
          태그 저장
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`/api/analysis/${encodeURIComponent(analysisId)}/export/markdown`}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222]"
        >
          <FileText size={14} aria-hidden="true" />
          Markdown 다운로드
        </a>
        <a
          href={`/api/analysis/${encodeURIComponent(analysisId)}/export/pdf`}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222]"
        >
          <Download size={14} aria-hidden="true" />
          PDF 다운로드
        </a>
        {message ? <span className="text-xs text-[#6a6a6a]">{message}</span> : null}
      </div>
    </div>
  );
}
