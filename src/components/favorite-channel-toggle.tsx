"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star } from "lucide-react";

export function FavoriteChannelToggle({
  channelId,
  initialFavorite,
}: {
  channelId: string;
  initialFavorite: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);

    const nextFavorite = !favorite;
    const response = await fetch(
      `/api/channels/${encodeURIComponent(channelId)}/favorite`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: nextFavorite }),
      },
    );

    if (response.ok) {
      setFavorite(nextFavorite);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222] disabled:cursor-not-allowed disabled:text-[#929292]"
    >
      <Star
        size={14}
        aria-hidden="true"
        fill={favorite ? "#ff385c" : "none"}
        className={favorite ? "text-[#ff385c]" : ""}
      />
      {favorite ? "즐겨찾기" : "일반"}
    </button>
  );
}
