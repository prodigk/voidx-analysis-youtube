"use client";

import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import type { YouTubeRefreshResult, YouTubeVideo } from "@/lib/youtube";
import { formatCompactNumber, formatDate } from "@/lib/format";
import { AiAnalysisActions } from "@/components/ai-analysis-actions";
import { ChannelSaveActions } from "@/components/channel-save-actions";

type RefreshState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "success"; message?: string }
  | { status: "error"; message: string };

type StoredRefresh = {
  identifier: string;
  result: YouTubeRefreshResult | null;
  message?: string;
};

function getRefreshStorageKey(defaultIdentifier: string, storageKey?: string) {
  if (storageKey) {
    return storageKey;
  }

  if (defaultIdentifier) {
    return `channel-essence:refresh:${defaultIdentifier}`;
  }

  return "channel-essence:refresh:channels";
}

function getStoredRefresh(
  defaultIdentifier: string,
  storageKey?: string,
): StoredRefresh {
  if (typeof window === "undefined") {
    return { identifier: defaultIdentifier, result: null };
  }

  const raw = window.localStorage.getItem(
    getRefreshStorageKey(defaultIdentifier, storageKey),
  );

  if (!raw) {
    return { identifier: defaultIdentifier, result: null };
  }

  try {
    const parsed = JSON.parse(raw) as StoredRefresh;

    return {
      identifier: parsed.identifier || defaultIdentifier,
      result: parsed.result ?? null,
      message: parsed.message,
    };
  } catch {
    return { identifier: defaultIdentifier, result: null };
  }
}

function saveStoredRefresh(
  defaultIdentifier: string,
  storageKey: string | undefined,
  data: StoredRefresh,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getRefreshStorageKey(defaultIdentifier, storageKey),
    JSON.stringify(data),
  );
}

export function YouTubeRefreshPanel({
  defaultIdentifier = "",
  storageKey,
}: {
  defaultIdentifier?: string;
  storageKey?: string;
}) {
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [result, setResult] = useState<YouTubeRefreshResult | null>(null);
  const [state, setState] = useState<RefreshState>({ status: "idle" });

  useEffect(() => {
    queueMicrotask(() => {
      const stored = getStoredRefresh(defaultIdentifier, storageKey);

      setIdentifier(stored.identifier);
      setResult(stored.result);
      setState(
        stored.result
          ? {
              status: "success",
              message: stored.message ?? "저장된 채널 데이터를 불러왔습니다.",
            }
          : { status: "idle" },
      );
    });
  }, [defaultIdentifier, storageKey]);

  async function refreshData() {
    setState({ status: "loading", message: "YouTube 데이터를 새로 불러오는 중입니다." });

    const params = new URLSearchParams({ identifier });
    const response = await fetch(`/api/youtube/refresh?${params.toString()}`);
    const payload = (await response.json()) as YouTubeRefreshResult & {
      error?: string;
    };

    if (!response.ok) {
      setState({
        status: "error",
        message: payload.error ?? "데이터 새로고침에 실패했습니다.",
      });
      return;
    }

    setResult(payload);
    const message = `업데이트 완료: ${new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(payload.refreshedAt))}`;

    setState({
      status: "success",
      message,
    });
    saveStoredRefresh(defaultIdentifier, storageKey, {
      identifier,
      result: payload,
      message,
    });
  }

  const channel = result?.channel;

  return (
    <section className="mt-6 rounded-[14px] border border-[#ebebeb] bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
            Data Refresh
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#222222]">
            YouTube API로 최신 데이터 확인
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
            채널 통계, 최근 영상, 인기 영상을 한 번에 불러옵니다.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-[560px]">
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="@handle, 채널 URL, 채널 ID"
            className="h-11 flex-1 rounded-full border border-[#dddddd] px-4 text-sm outline-none focus:border-[#222222]"
          />
          <button
            type="button"
            onClick={refreshData}
            disabled={state.status === "loading" || !identifier.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#ff385c] px-5 text-sm font-semibold text-white transition hover:bg-[#e00b41] disabled:cursor-not-allowed disabled:bg-[#ffd1da]"
          >
            <RefreshCw
              size={16}
              className={state.status === "loading" ? "animate-spin" : ""}
              aria-hidden="true"
            />
            새로고침
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

      {channel ? (
        <div className="mt-5 grid gap-5">
          <div className="rounded-[14px] bg-[#f7f7f7] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {channel.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.thumbnailUrl}
                    alt=""
                    className="size-14 rounded-full object-cover"
                  />
                ) : null}
                <div>
                  <h3 className="text-lg font-semibold text-[#222222]">
                    {channel.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#6a6a6a]">{channel.handle}</p>
                </div>
              </div>
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222]"
              >
                YouTube
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </div>
            <div className="mt-4">
              <ChannelSaveActions channel={channel} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <Metric
                label="구독자"
                value={
                  channel.subscribers === null
                    ? "비공개"
                    : formatCompactNumber(channel.subscribers)
                }
              />
              <Metric label="총 조회수" value={formatCompactNumber(channel.totalViews)} />
              <Metric label="영상 수" value={channel.videoCount.toLocaleString("ko-KR")} />
              <Metric
                label="최근 평균 조회"
                value={formatCompactNumber(result.averageRecentViews)}
              />
              <Metric label="개설일" value={formatDate(channel.publishedAt)} />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <VideoPanel title="최근 영상" videos={result.recentVideos} />
            <VideoPanel title="인기 영상" videos={result.popularVideos} />
          </div>

          <div className="rounded-[14px] border border-[#ebebeb] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.04em] text-[#ff385c]">
              AI Analysis
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#222222]">
              이 채널 데이터로 분석 생성
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#6a6a6a]">
              생성 결과는 인사이트 보드에 저장됩니다.
            </p>
            <div className="mt-4">
              <AiAnalysisActions
                input={{ channelRefresh: result }}
                actions={[
                  "channel_analysis",
                  "sleep_culture_strategy",
                  "video_ideas",
                ]}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white p-3">
      <p className="text-xs font-semibold text-[#6a6a6a]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#222222]">{value}</p>
    </div>
  );
}

function VideoPanel({ title, videos }: { title: string; videos: YouTubeVideo[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#222222]">{title}</h3>
      <div className="mt-3 grid gap-3">
        {videos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="grid gap-3 rounded-[14px] border border-[#ebebeb] bg-white p-3 transition hover:border-[#222222] sm:grid-cols-[120px_1fr]"
          >
            {video.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnailUrl}
                alt=""
                className="aspect-video w-full rounded-[8px] object-cover"
              />
            ) : null}
            <div>
              <p className="line-clamp-2 text-sm font-semibold leading-6 text-[#222222]">
                {video.title}
              </p>
              <p className="mt-2 text-xs text-[#6a6a6a]">
                조회수 {formatCompactNumber(video.views)} · {video.duration} ·{" "}
                {formatDate(video.publishedAt)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
