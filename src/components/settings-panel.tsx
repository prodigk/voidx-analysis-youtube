"use client";

import { useState } from "react";
import { KeyRound, Plus, Save } from "lucide-react";
import { categories } from "@/lib/categories";

export function SettingsPanel() {
  const [draftCategory, setDraftCategory] = useState("문화비평");
  const [prompt, setPrompt] = useState(
    "채널의 성공 요인을 What, Why, Pattern, Gap, Apply 순서로 분석한다.",
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
              Categories
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#222222]">
              카테고리 관리
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full bg-[#222222] text-white"
            aria-label="카테고리 추가"
          >
            <Plus size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-[14px] border border-[#ebebeb] px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#222222]">{category.name}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
                    {category.keywords.join(" · ")}
                  </p>
                </div>
                <span className="inline-flex h-8 w-fit items-center rounded-full bg-[#f7f7f7] px-3 text-xs font-semibold text-[#3f3f3f]">
                  경쟁 {category.competition}
                </span>
              </div>
            </div>
          ))}
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-semibold text-[#222222]">
            새 카테고리 초안
          </span>
          <input
            value={draftCategory}
            onChange={(event) => setDraftCategory(event.target.value)}
            className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
          />
        </label>
      </section>

      <div className="grid gap-6">
        <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            Manual Channel
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            채널 수동 추가
          </h2>
          <div className="mt-5 grid gap-3">
            <input
              placeholder="채널명"
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            />
            <input
              placeholder="https://youtube.com/@channel"
              className="h-12 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
            />
            <textarea
              placeholder="대표 주제와 분석 메모"
              rows={4}
              className="resize-none rounded-[14px] border border-[#dddddd] px-4 py-3 text-sm outline-none focus:border-[#222222]"
            />
          </div>
        </section>

        <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            API Keys
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            API Key 설정
          </h2>
          <div className="mt-5 rounded-[14px] bg-[#f7f7f7] p-4">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#222222]">
                <KeyRound size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#222222]">
                  서버 환경변수로만 사용
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
                  프로젝트 루트의 <code className="font-mono">.env</code> 또는{" "}
                  <code className="font-mono">.env.local</code>에{" "}
                  <code className="font-mono">YOUTUBE_API_KEY</code>와{" "}
                  <code className="font-mono">OPENAI_API_KEY</code>를 추가하면
                  YouTube 데이터 조회와 AI 분석 생성이 활성화됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            Prompts
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            분석 프롬프트 관리
          </h2>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={5}
            className="mt-5 w-full resize-none rounded-[14px] border border-[#dddddd] px-4 py-3 text-sm leading-6 outline-none focus:border-[#222222]"
          />
          <button
            type="button"
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#222222] px-5 text-sm font-semibold text-[#222222]"
          >
            <Save size={16} aria-hidden="true" />
            저장
          </button>
        </section>
      </div>
    </div>
  );
}
