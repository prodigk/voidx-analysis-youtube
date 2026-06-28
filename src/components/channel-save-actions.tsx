"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save, Star } from "lucide-react";
import type { SavedChannel } from "@/lib/app-store-types";
import type { YouTubeChannelStats } from "@/lib/youtube";

type ActionState =
  | { status: "idle"; message?: string }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function ChannelSaveActions({
  channel,
}: {
  channel: YouTubeChannelStats;
}) {
  const router = useRouter();
  const [savedChannel, setSavedChannel] = useState<SavedChannel | null>(null);
  const [state, setState] = useState<ActionState>({ status: "idle" });

  async function save() {
    setState({ status: "loading", message: "채널을 저장하는 중입니다." });

    const response = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const payload = (await response.json()) as {
      channel?: SavedChannel;
      error?: string;
    };

    if (!response.ok || !payload.channel) {
      setState({
        status: "error",
        message: payload.error ?? "채널 저장에 실패했습니다.",
      });
      return;
    }

    setSavedChannel(payload.channel);
    setState({ status: "success", message: "채널 저장 완료" });
    router.refresh();
  }

  async function toggleFavorite() {
    const target = savedChannel;

    if (!target) {
      await save();
      return;
    }

    setState({ status: "loading", message: "즐겨찾기를 변경하는 중입니다." });

    const response = await fetch(
      `/api/channels/${encodeURIComponent(target.id)}/favorite`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !target.favorite }),
      },
    );
    const payload = (await response.json()) as {
      channel?: SavedChannel;
      error?: string;
    };

    if (!response.ok || !payload.channel) {
      setState({
        status: "error",
        message: payload.error ?? "즐겨찾기 변경에 실패했습니다.",
      });
      return;
    }

    setSavedChannel(payload.channel);
    setState({
      status: "success",
      message: payload.channel.favorite ? "즐겨찾기 추가" : "즐겨찾기 해제",
    });
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={state.status === "loading"}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#222222] px-3 text-xs font-semibold text-white transition hover:bg-[#3f3f3f] disabled:cursor-not-allowed disabled:bg-[#929292]"
        >
          <Save size={14} aria-hidden="true" />
          채널 저장
        </button>
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={state.status === "loading"}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222] disabled:cursor-not-allowed disabled:text-[#929292]"
        >
          <Star
            size={14}
            aria-hidden="true"
            fill={savedChannel?.favorite ? "#ff385c" : "none"}
            className={savedChannel?.favorite ? "text-[#ff385c]" : ""}
          />
          즐겨찾기
        </button>
      </div>
      {state.message ? (
        <p
          className={[
            "text-xs",
            state.status === "error" ? "text-[#c13515]" : "text-[#6a6a6a]",
          ].join(" ")}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
