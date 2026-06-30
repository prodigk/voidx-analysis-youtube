import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSavedChannels } from "@/lib/app-store";
import { requirePageUser } from "@/lib/auth";
import { formatCompactNumber } from "@/lib/format";
import { PageHeader, Section, EmptyState } from "@/components/ui-blocks";
import { YouTubeRefreshPanel } from "@/components/youtube-refresh-panel";
import { FavoriteChannelToggle } from "@/components/favorite-channel-toggle";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  await requirePageUser();

  const channels = await getSavedChannels();

  return (
    <div>
      <PageHeader
        eyebrow="Channels"
        title="실제 채널 데이터 조회"
        description="저장된 채널 목록이 없으면 가짜 목록을 표시하지 않습니다. YouTube 핸들, 채널 URL, 채널 ID를 입력해 실제 데이터를 불러오세요."
        action={{ href: "/categories", label: "카테고리로 검색" }}
      />

      <YouTubeRefreshPanel storageKey="channel-essence:refresh:channels" />

      <Section
        title="Channel Inventory"
        description="저장한 실제 YouTube 채널과 즐겨찾기 상태를 확인합니다."
      >
        {channels.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((item) => (
              <article
                key={item.id}
                className="rounded-[14px] border border-[#ebebeb] bg-white p-5"
              >
                <div className="flex items-start gap-3">
                  {item.channel.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.channel.thumbnailUrl}
                      alt=""
                      className="size-12 rounded-full object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/channels/${encodeURIComponent(item.id)}`}
                      className="block truncate text-sm font-semibold text-[#222222] underline decoration-[#ff385c] decoration-2 underline-offset-4 transition hover:text-[#e00b41]"
                    >
                      {item.channel.title}
                    </Link>
                    <p className="mt-1 text-xs text-[#6a6a6a]">
                      {item.channel.handle}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <Metric
                    label="구독자"
                    value={
                      item.channel.subscribers === null
                        ? "비공개"
                        : formatCompactNumber(item.channel.subscribers)
                    }
                  />
                  <Metric
                    label="조회수"
                    value={formatCompactNumber(item.channel.totalViews)}
                  />
                  <Metric
                    label="영상"
                    value={item.channel.videoCount.toLocaleString("ko-KR")}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <FavoriteChannelToggle
                    channelId={item.id}
                    initialFavorite={item.favorite}
                  />
                  <a
                    href={item.channel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222] transition hover:border-[#222222]"
                  >
                    YouTube
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState description="아직 저장된 채널 데이터가 없습니다." />
        )}
      </Section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#f7f7f7] p-2">
      <p className="font-semibold text-[#6a6a6a]">{label}</p>
      <p className="mt-1 font-semibold text-[#222222]">{value}</p>
    </div>
  );
}
