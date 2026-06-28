"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";
import { categories } from "@/lib/categories";
import { DataBadge, Section } from "@/components/ui-blocks";
import { AiAnalysisActions } from "@/components/ai-analysis-actions";
import { VideoPlanManager } from "@/components/video-plan-manager";

export function StrategyGenerator() {
  const [categoryId, setCategoryId] = useState("books");
  const [topic, setTopic] = useState("");
  const [book, setBook] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [submittedInput, setSubmittedInput] = useState<{
    categoryName: string;
    topic: string;
    book: string;
    tone: string;
    audience: string;
  } | null>(null);

  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? categories[0];

  function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedInput({
      categoryName: selectedCategory.name,
      topic,
      book,
      tone,
      audience,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[410px_1fr]">
      <form
        onSubmit={handleGenerate}
        className="rounded-[14px] border border-[#ebebeb] bg-white p-5"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            Strategy Input
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            영상 기획 입력값
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">
            실제 분석 데이터가 연결되기 전까지 결과 영역은 비워둡니다.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">카테고리</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">책 제목</span>
            <input
              value={book}
              onChange={(event) => setBook(event.target.value)}
              placeholder="예: 불안의 책"
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">주제</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="예: 불안한 시대에 나를 지키는 법"
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">원하는 톤</span>
            <input
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              placeholder="예: 차분하고 지적인"
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">타겟 시청자</span>
            <textarea
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              placeholder="예: 잠들기 전 조용한 교양을 듣고 싶은 직장인"
              rows={4}
              className="resize-none rounded-[14px] border border-[#dddddd] px-4 py-3 text-sm leading-6 outline-none focus:border-[#222222]"
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff385c] px-5 text-sm font-semibold text-white transition hover:bg-[#e00b41]"
        >
          <WandSparkles size={17} aria-hidden="true" />
          실제 데이터로 생성 시도
        </button>
      </form>

      <div className="grid gap-5">
        <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
          <p className="text-sm font-semibold text-[#222222]">입력 요약</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <DataBadge>{selectedCategory.name}</DataBadge>
            {tone ? <DataBadge>{tone}</DataBadge> : null}
            {topic ? <DataBadge>{topic}</DataBadge> : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#3f3f3f]">
            입력값을 바탕으로 영상 아이디어를 생성하고 인사이트 보드에 저장합니다.
          </p>
        </section>

        <Section title="영상 콘셉트">
          {submittedInput ? (
            <AiAnalysisActions input={submittedInput} actions={["video_ideas"]} />
          ) : (
            <div className="rounded-[14px] border border-dashed border-[#dddddd] bg-white p-6 text-center">
              <p className="text-sm font-semibold text-[#222222]">데이터 없음</p>
              <p className="mt-2 text-sm leading-6 text-[#6a6a6a]">
                입력값을 작성한 뒤 생성 버튼을 눌러주세요.
              </p>
            </div>
          )}
        </Section>

        <VideoPlanManager
          draft={{
            categoryName: selectedCategory.name,
            topic,
            book,
            tone,
            audience,
          }}
        />
      </div>
    </div>
  );
}
