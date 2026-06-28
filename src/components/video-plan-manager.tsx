"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { SavedVideoPlan, TitleCandidate } from "@/lib/app-store-types";

type VideoPlanDraft = {
  title: string;
  categoryName: string;
  topic: string;
  book: string;
  tone: string;
  audience: string;
  thumbnailMemo: string;
  titleCandidates: TitleCandidate[];
};

const emptyCandidate = (index: number): TitleCandidate => ({
  id: crypto.randomUUID(),
  title: "",
  score: Math.max(5 - index, 1),
  memo: "",
});

export function VideoPlanManager({
  draft,
}: {
  draft: Omit<VideoPlanDraft, "title" | "titleCandidates" | "thumbnailMemo">;
}) {
  const [plans, setPlans] = useState<SavedVideoPlan[]>([]);
  const [title, setTitle] = useState(draft.topic || draft.book || "");
  const [thumbnailMemo, setThumbnailMemo] = useState("");
  const [titleCandidates, setTitleCandidates] = useState<TitleCandidate[]>([
    emptyCandidate(0),
    emptyCandidate(1),
    emptyCandidate(2),
  ]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/video-plans")
      .then((response) => response.json())
      .then((payload: { plans?: SavedVideoPlan[] }) =>
        setPlans(payload.plans ?? []),
      )
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      if (draft.topic || draft.book) {
        setTitle(draft.topic || draft.book);
      }
    });
  }, [draft.topic, draft.book]);

  function updateCandidate(
    id: string,
    field: keyof Omit<TitleCandidate, "id">,
    value: string,
  ) {
    setTitleCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              [field]: field === "score" ? Number(value) : value,
            }
          : candidate,
      ),
    );
  }

  async function savePlan() {
    const response = await fetch("/api/video-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        title,
        thumbnailMemo,
        titleCandidates,
      }),
    });
    const payload = (await response.json()) as {
      plan?: SavedVideoPlan;
      error?: string;
    };

    if (!response.ok || !payload.plan) {
      setMessage(payload.error ?? "기획안 저장에 실패했습니다.");
      return;
    }

    setPlans((current) => [payload.plan!, ...current]);
    setMessage("영상 기획안 저장 완료");
  }

  const rankedCandidates = [...titleCandidates]
    .filter((candidate) => candidate.title.trim())
    .sort((a, b) => b.score - a.score);

  return (
    <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
        Planning Archive
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[#222222]">
        영상 기획안 저장
      </h3>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#222222]">기획안 제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="저장할 기획안 이름"
            className="h-11 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
          />
        </label>

        <div className="grid gap-3">
          <p className="text-sm font-semibold text-[#222222]">제목 후보 비교</p>
          {titleCandidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="grid gap-2 rounded-[14px] border border-[#ebebeb] p-3 lg:grid-cols-[1fr_96px_1fr]"
            >
              <input
                value={candidate.title}
                onChange={(event) =>
                  updateCandidate(candidate.id, "title", event.target.value)
                }
                placeholder={`제목 후보 ${index + 1}`}
                className="h-10 rounded-full border border-[#dddddd] px-3 text-sm outline-none focus:border-[#222222]"
              />
              <select
                value={candidate.score}
                onChange={(event) =>
                  updateCandidate(candidate.id, "score", event.target.value)
                }
                className="h-10 rounded-full border border-[#dddddd] px-3 text-sm outline-none focus:border-[#222222]"
              >
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>
                    {score}점
                  </option>
                ))}
              </select>
              <input
                value={candidate.memo}
                onChange={(event) =>
                  updateCandidate(candidate.id, "memo", event.target.value)
                }
                placeholder="비교 메모"
                className="h-10 rounded-full border border-[#dddddd] px-3 text-sm outline-none focus:border-[#222222]"
              />
            </div>
          ))}
        </div>

        {rankedCandidates.length > 0 ? (
          <div className="rounded-[14px] bg-[#f7f7f7] p-4">
            <p className="text-sm font-semibold text-[#222222]">현재 순위</p>
            <ol className="mt-3 grid gap-2 text-sm text-[#3f3f3f]">
              {rankedCandidates.map((candidate, index) => (
                <li key={candidate.id}>
                  {index + 1}. {candidate.title} · {candidate.score}점
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-[#222222]">
            썸네일 방향성 메모
          </span>
          <textarea
            value={thumbnailMemo}
            onChange={(event) => setThumbnailMemo(event.target.value)}
            rows={4}
            placeholder="예: 어두운 배경, 따뜻한 조명, 책 표지보다 감정 키워드를 크게"
            className="resize-none rounded-[14px] border border-[#dddddd] px-4 py-3 text-sm leading-6 outline-none focus:border-[#222222]"
          />
        </label>

        <button
          type="button"
          onClick={savePlan}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-[#222222] px-4 text-sm font-semibold text-white transition hover:bg-[#3f3f3f]"
        >
          <Save size={16} aria-hidden="true" />
          기획안 저장
        </button>
        {message ? <p className="text-sm text-[#6a6a6a]">{message}</p> : null}
      </div>

      <div className="mt-6 border-t border-[#ebebeb] pt-5">
        <h4 className="text-sm font-semibold text-[#222222]">저장된 기획안</h4>
        {plans.length > 0 ? (
          <div className="mt-3 grid gap-3">
            {plans.slice(0, 6).map((plan) => (
              <article
                key={plan.id}
                className="rounded-[14px] border border-[#ebebeb] p-4"
              >
                <p className="text-sm font-semibold text-[#222222]">
                  {plan.title}
                </p>
                <p className="mt-1 text-xs text-[#6a6a6a]">
                  {plan.categoryName} · {plan.topic || plan.book || "주제 없음"}
                </p>
                {plan.titleCandidates.length > 0 ? (
                  <p className="mt-3 text-sm text-[#3f3f3f]">
                    1순위 제목:{" "}
                    {
                      [...plan.titleCandidates].sort(
                        (a, b) => b.score - a.score,
                      )[0].title
                    }
                  </p>
                ) : null}
                {plan.thumbnailMemo ? (
                  <p className="mt-2 text-sm leading-6 text-[#3f3f3f]">
                    {plan.thumbnailMemo}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-[14px] border border-dashed border-[#dddddd] p-4 text-sm text-[#6a6a6a]">
            아직 저장된 영상 기획안이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
