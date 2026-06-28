"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { categories } from "@/lib/categories";
import { DataBadge, EmptyState, Section } from "@/components/ui-blocks";
import { YouTubeCandidateSearch } from "@/components/youtube-candidate-search";

const categoryStorageKey = "channel-essence:selected-category";

function getInitialCategoryId() {
  if (typeof window === "undefined") {
    return "books";
  }

  const stored = window.localStorage.getItem(categoryStorageKey);

  return categories.some((category) => category.id === stored)
    ? stored ?? "books"
    : "books";
}

export function CategoryExplorer() {
  const [categoryId, setCategoryId] = useState("books");
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? categories[0];

  useEffect(() => {
    queueMicrotask(() => {
      setCategoryId(getInitialCategoryId());
    });
  }, []);

  function updateCategoryId(nextCategoryId: string) {
    setCategoryId(nextCategoryId);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(categoryStorageKey, nextCategoryId);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[14px] border border-[#ebebeb] bg-white p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-[#222222]">
              카테고리 선택
            </span>
            <select
              value={categoryId}
              onChange={(event) => updateCategoryId(event.target.value)}
              className="h-12 rounded-full border border-[#dddddd] bg-white px-4 text-sm font-medium text-[#222222] outline-none transition focus:border-[#222222]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[14px] bg-[#f7f7f7] p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#222222]">
                <Search size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#222222]">
                  실제 YouTube 검색
                </p>
                <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
                  아래 검색 버튼을 눌렀을 때만 YouTube API 데이터를 불러옵니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-2xl font-semibold text-[#222222]">
              {selectedCategory.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#3f3f3f]">
              {selectedCategory.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory.keywords.map((keyword) => (
                <DataBadge key={keyword}>{keyword}</DataBadge>
              ))}
            </div>
          </div>
          <div className="rounded-[14px] bg-[#f7f7f7] p-4">
            <p className="text-sm font-semibold text-[#222222]">카테고리 요약</p>
            <dl className="mt-3 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#6a6a6a]">경쟁 강도</dt>
                <dd className="font-semibold text-[#222222]">
                  {selectedCategory.competition}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-[#6a6a6a]">검색 방향</dt>
                <dd className="leading-6 text-[#222222]">
                  {selectedCategory.opportunity}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <YouTubeCandidateSearch
        key={selectedCategory.id}
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
      />

      <Section
        title="저장된 채널 비교"
        description="DB 저장 기능이 연결되면 실제로 저장한 채널만 표시됩니다."
      >
        <EmptyState description="아직 저장된 채널 데이터가 없습니다." />
      </Section>

      <Section
        title="카테고리 공통 패턴"
        description="실제 분석 결과가 없으면 가짜 패턴을 표시하지 않습니다."
      >
        <EmptyState description="아직 불러온 분석 데이터가 없습니다." />
      </Section>
    </div>
  );
}
