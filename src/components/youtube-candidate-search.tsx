"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import type { YouTubeChannelCandidate } from "@/lib/youtube";
import { formatCompactNumber } from "@/lib/format";
import { AiAnalysisActions } from "@/components/ai-analysis-actions";

type SearchState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "success"; message?: string }
  | { status: "error"; message: string };

type StoredCandidateSearch = {
  query: string;
  channels: YouTubeChannelCandidate[];
  message?: string;
};

function getCandidateStorageKey(categoryId: string) {
  return `channel-essence:candidate-search:${categoryId}`;
}

function getStoredCandidateSearch(categoryId: string): StoredCandidateSearch {
  if (typeof window === "undefined") {
    return { query: "", channels: [] };
  }

  const raw = window.localStorage.getItem(getCandidateStorageKey(categoryId));

  if (!raw) {
    return { query: "", channels: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredCandidateSearch;

    return {
      query: parsed.query ?? "",
      channels: Array.isArray(parsed.channels) ? parsed.channels : [],
      message: parsed.message,
    };
  } catch {
    return { query: "", channels: [] };
  }
}

function saveCandidateSearch(categoryId: string, data: StoredCandidateSearch) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getCandidateStorageKey(categoryId),
    JSON.stringify(data),
  );
}

export function YouTubeCandidateSearch({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<YouTubeChannelCandidate[]>([]);
  const [state, setState] = useState<SearchState>({ status: "idle" });

  useEffect(() => {
    queueMicrotask(() => {
      const stored = getStoredCandidateSearch(categoryId);

      setQuery(stored.query);
      setChannels(stored.channels);
      setState(
        stored.channels.length > 0
          ? {
              status: "success",
              message:
                stored.message ??
                `저장된 후보 ${stored.channels.length}개를 불러왔습니다.`,
            }
          : { status: "idle" },
      );
    });
  }, [categoryId]);

  async function runSearch() {
    setState({ status: "loading", message: "YouTube 후보 채널을 찾는 중입니다." });

    const params = new URLSearchParams({
      categoryId,
      maxResults: "8",
    });

    if (query.trim()) {
      params.set("query", query.trim());
    }

    const response = await fetch(`/api/youtube/channels/search?${params.toString()}`);
    const payload = (await response.json()) as {
      channels?: YouTubeChannelCandidate[];
      error?: string;
    };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "후보 채널 검색에 실패했습니다.",
      });
      return;
    }

    const nextChannels = payload.channels ?? [];
    const message = `${nextChannels.length}개 후보를 불러왔습니다.`;

    setChannels(nextChannels);
    setState({
      status: "success",
      message,
    });
    saveCandidateSearch(categoryId, {
      query: query.trim(),
      channels: nextChannels,
      message,
    });
  }

  return (
    <section className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            YouTube API
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            카테고리별 후보 채널 검색
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
            {categoryName} 카테고리 키워드로 실제 YouTube 채널 후보를 검색하고
            구독자 수 기준으로 정렬합니다.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-[520px]">
          <label className="flex h-11 flex-1 items-center gap-2 rounded-full border border-[#dddddd] px-4">
            <Search size={16} className="text-[#6a6a6a]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="검색어 비우면 카테고리 키워드 사용"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#929292]"
            />
          </label>
          <button
            type="button"
            onClick={runSearch}
            disabled={state.status === "loading"}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#222222] px-5 text-sm font-semibold text-white transition hover:bg-[#3f3f3f] disabled:cursor-not-allowed disabled:bg-[#929292]"
          >
            <RefreshCw
              size={16}
              className={state.status === "loading" ? "animate-spin" : ""}
              aria-hidden="true"
            />
            검색
          </button>
        </div>
      </div>

      {state.message ? (
        <p
          className={[
            "mt-4 rounded-[14px] px-4 py-3 text-sm",
            state.status === "error"
              ? "bg-[#fff1ed] text-[#c13515]"
              : "bg-[#f7f7f7] text-[#3f3f3f]",
          ].join(" ")}
        >
          {state.message}
        </p>
      ) : null}

      {channels.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#dddddd] bg-white">
          <div className="border-b border-[#ebebeb] bg-[#f7f7f7] px-4 py-3">
            <p className="text-sm font-semibold text-[#222222]">
              구독자수 기준 후보 채널 랭킹
            </p>
            <p className="mt-1 text-xs text-[#6a6a6a]">
              비공개 구독자 수는 랭킹 하단으로 정렬됩니다.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="bg-white text-xs font-bold uppercase tracking-[0.04em] text-[#6a6a6a]">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Subscribers</th>
                  <th className="px-4 py-3">Total Views</th>
                  <th className="px-4 py-3">Videos</th>
                  <th className="px-4 py-3">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {channels.map((channel, index) => (
                  <tr key={channel.id} className="align-middle">
                    <td className="px-4 py-4">
                      <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#222222] text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        {channel.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={channel.thumbnailUrl}
                            alt=""
                            className="size-11 rounded-full object-cover"
                          />
                        ) : null}
                        <Link
                          href={`/channels/${encodeURIComponent(channel.id)}`}
                          className="min-w-0 group"
                          title={`${channel.title} 채널 분석 페이지로 이동`}
                        >
                          <h3 className="truncate font-semibold text-[#222222] underline decoration-[#ff385c] decoration-2 underline-offset-4 transition group-hover:text-[#e00b41]">
                            {channel.title}
                          </h3>
                          <p className="mt-1 text-xs text-[#6a6a6a]">
                            {channel.handle}
                          </p>
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-[#222222]">
                      {channel.subscribers === null
                        ? "비공개"
                        : formatCompactNumber(channel.subscribers)}
                    </td>
                    <td className="px-4 py-4 text-[#3f3f3f]">
                      {formatCompactNumber(channel.totalViews)}
                    </td>
                    <td className="px-4 py-4 text-[#3f3f3f]">
                      {channel.videoCount.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222]"
                      >
                        YouTube
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {channels.length > 0 ? (
        <div className="mt-4 rounded-[14px] border border-[#ebebeb] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            AI Analysis
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#222222]">
            검색된 후보 채널로 인사이트 생성
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
            구독자수 랭킹 결과를 바탕으로 카테고리 인사이트와 채널 비교 분석을
            저장합니다.
          </p>
          <div className="mt-4">
            <AiAnalysisActions
              input={{ categoryName, channels }}
              actions={["category_insight", "channel_comparison"]}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
