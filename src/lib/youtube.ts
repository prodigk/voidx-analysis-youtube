import { categories } from "@/lib/categories";

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3";

export type YouTubeChannelStats = {
  id: string;
  title: string;
  handle: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  subscribers: number | null;
  totalViews: number;
  videoCount: number;
  uploadsPlaylistId: string;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
};

export type YouTubeChannelCandidate = YouTubeChannelStats & {
  matchQuery: string;
};

export type YouTubeRefreshResult = {
  refreshedAt: string;
  channel: YouTubeChannelStats;
  recentVideos: YouTubeVideo[];
  popularVideos: YouTubeVideo[];
  averageRecentViews: number;
};

type YouTubeListResponse<T> = {
  items?: T[];
  nextPageToken?: string;
  error?: {
    message?: string;
    errors?: { reason?: string; message?: string }[];
  };
};

type YouTubeChannelItem = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails?: YouTubeThumbnails;
  };
  statistics?: {
    viewCount?: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount?: string;
  };
  contentDetails?: {
    relatedPlaylists?: {
      uploads?: string;
    };
  };
};

type YouTubeSearchItem = {
  id: {
    channelId?: string;
    videoId?: string;
  };
  snippet: {
    title: string;
    channelId: string;
  };
};

type YouTubePlaylistItem = {
  contentDetails?: {
    videoId?: string;
  };
  snippet?: {
    resourceId?: {
      videoId?: string;
    };
  };
};

type YouTubeVideoItem = {
  id: string;
  snippet: {
    title: string;
    description?: string;
    publishedAt: string;
    thumbnails?: YouTubeThumbnails;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
};

type YouTubeThumbnails = {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
};

function getApiKey() {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    throw new Error("YOUTUBE_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  return key;
}

async function youtubeFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/${path}`);
  url.searchParams.set("key", getApiKey());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  const payload = (await response.json()) as YouTubeListResponse<T>;

  if (!response.ok) {
    const reason = payload.error?.errors?.[0]?.reason;
    const message = payload.error?.message ?? "YouTube API 요청에 실패했습니다.";
    throw new Error(reason ? `${message} (${reason})` : message);
  }

  return payload;
}

function toNumber(value: string | undefined) {
  return Number.parseInt(value ?? "0", 10) || 0;
}

function getLargestThumbnail(thumbnails?: YouTubeThumbnails) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
}

function normalizeHandle(customUrl: string | undefined, fallbackTitle: string) {
  if (customUrl) {
    return customUrl.startsWith("@") ? customUrl : `@${customUrl}`;
  }

  return `@${fallbackTitle.replace(/\s+/g, "")}`;
}

function toChannelStats(item: YouTubeChannelItem): YouTubeChannelStats {
  const title = item.snippet.title;
  const handle = normalizeHandle(item.snippet.customUrl, title);

  return {
    id: item.id,
    title,
    handle,
    description: item.snippet.description ?? "",
    url: `https://www.youtube.com/channel/${item.id}`,
    thumbnailUrl: getLargestThumbnail(item.snippet.thumbnails),
    publishedAt: item.snippet.publishedAt,
    subscribers: item.statistics?.hiddenSubscriberCount
      ? null
      : toNumber(item.statistics?.subscriberCount),
    totalViews: toNumber(item.statistics?.viewCount),
    videoCount: toNumber(item.statistics?.videoCount),
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? "",
  };
}

function toVideo(item: YouTubeVideoItem): YouTubeVideo {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description ?? "",
    thumbnailUrl: getLargestThumbnail(item.snippet.thumbnails),
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    views: toNumber(item.statistics?.viewCount),
    likes: toNumber(item.statistics?.likeCount),
    comments: toNumber(item.statistics?.commentCount),
    duration: formatIsoDuration(item.contentDetails?.duration ?? "PT0S"),
  };
}

function extractIdentifier(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return { type: "empty" as const, value: "" };
  }

  if (trimmed.startsWith("UC") && trimmed.length >= 20) {
    return { type: "channelId" as const, value: trimmed };
  }

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    const channelIndex = segments.indexOf("channel");

    if (channelIndex >= 0 && segments[channelIndex + 1]) {
      return { type: "channelId" as const, value: segments[channelIndex + 1] };
    }

    const handle = segments.find((segment) => segment.startsWith("@"));

    if (handle) {
      return { type: "handle" as const, value: handle };
    }
  } catch {
    // Plain handles and channel names are handled below.
  }

  if (trimmed.startsWith("@")) {
    return { type: "handle" as const, value: trimmed };
  }

  return { type: "query" as const, value: trimmed };
}

async function getChannelById(channelId: string) {
  const payload = await youtubeFetch<YouTubeChannelItem>("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
    maxResults: 1,
  });

  return payload.items?.[0] ? toChannelStats(payload.items[0]) : null;
}

async function getChannelByHandle(handle: string) {
  const normalizedHandle = handle.startsWith("@") ? handle : `@${handle}`;
  const payload = await youtubeFetch<YouTubeChannelItem>("channels", {
    part: "snippet,statistics,contentDetails",
    forHandle: normalizedHandle,
    maxResults: 1,
  });

  return payload.items?.[0] ? toChannelStats(payload.items[0]) : null;
}

async function searchChannelId(query: string) {
  const payload = await youtubeFetch<YouTubeSearchItem>("search", {
    part: "snippet",
    type: "channel",
    q: query,
    maxResults: 1,
  });

  return payload.items?.[0]?.id.channelId ?? null;
}

export async function getYouTubeChannel(identifier: string) {
  const parsed = extractIdentifier(identifier);

  if (parsed.type === "empty") {
    throw new Error("채널 URL, 핸들, 채널 ID 중 하나를 입력하세요.");
  }

  if (parsed.type === "channelId") {
    const channel = await getChannelById(parsed.value);

    if (channel) {
      return channel;
    }
  }

  if (parsed.type === "handle") {
    const channel = await getChannelByHandle(parsed.value);

    if (channel) {
      return channel;
    }
  }

  const channelId = await searchChannelId(parsed.value);

  if (!channelId) {
    throw new Error("YouTube 채널을 찾지 못했습니다.");
  }

  const channel = await getChannelById(channelId);

  if (!channel) {
    throw new Error("YouTube 채널 정보를 불러오지 못했습니다.");
  }

  return channel;
}

export async function getRecentVideos(identifier: string, maxResults = 8) {
  const channel = await getYouTubeChannel(identifier);

  return getRecentVideosForChannel(channel, maxResults);
}

async function getRecentVideosForChannel(
  channel: YouTubeChannelStats,
  maxResults = 8,
) {
  if (!channel.uploadsPlaylistId) {
    return [];
  }

  const payload = await youtubeFetch<YouTubePlaylistItem>("playlistItems", {
    part: "snippet,contentDetails",
    playlistId: channel.uploadsPlaylistId,
    maxResults,
  });
  const videoIds =
    payload.items
      ?.map((item) => item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(",") ?? "";

  return getVideosByIds(videoIds);
}

export async function getPopularVideos(identifier: string, maxResults = 8) {
  const channel = await getYouTubeChannel(identifier);

  return getPopularVideosForChannel(channel, maxResults);
}

async function getPopularVideosForChannel(
  channel: YouTubeChannelStats,
  maxResults = 8,
) {
  const payload = await youtubeFetch<YouTubeSearchItem>("search", {
    part: "snippet",
    channelId: channel.id,
    type: "video",
    order: "viewCount",
    maxResults,
  });
  const videoIds =
    payload.items
      ?.map((item) => item.id.videoId)
      .filter(Boolean)
      .join(",") ?? "";

  return getVideosByIds(videoIds);
}

export async function searchCandidateChannels({
  query,
  categoryId,
  maxResults = 8,
}: {
  query?: string;
  categoryId?: string;
  maxResults?: number;
}) {
  const category = categories.find((item) => item.id === categoryId);
  const matchQuery =
    query?.trim() ||
    (category
      ? `${category.name} ${category.keywords.slice(0, 4).join(" ")} 유튜브`
      : "");

  if (!matchQuery) {
    throw new Error("검색어 또는 카테고리를 입력하세요.");
  }

  const payload = await youtubeFetch<YouTubeSearchItem>("search", {
    part: "snippet",
    type: "channel",
    q: matchQuery,
    maxResults,
    relevanceLanguage: "ko",
    regionCode: "KR",
  });
  const channelIds =
    payload.items
      ?.map((item) => item.id.channelId ?? item.snippet.channelId)
      .filter(Boolean)
      .join(",") ?? "";

  if (!channelIds) {
    return [];
  }

  const details = await youtubeFetch<YouTubeChannelItem>("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelIds,
    maxResults,
  });

  return (
    details.items
      ?.map(toChannelStats)
      .sort((a, b) => (b.subscribers ?? 0) - (a.subscribers ?? 0))
      .map((channel) => ({ ...channel, matchQuery })) ?? []
  );
}

export async function refreshYouTubeChannel(identifier: string) {
  const channel = await getYouTubeChannel(identifier);
  const [recentVideos, popularVideos] = await Promise.all([
    getRecentVideosForChannel(channel, 8),
    getPopularVideosForChannel(channel, 8),
  ]);
  const averageRecentViews = recentVideos.length
    ? Math.round(
        recentVideos.reduce((sum, video) => sum + video.views, 0) /
          recentVideos.length,
      )
    : 0;

  return {
    refreshedAt: new Date().toISOString(),
    channel,
    recentVideos,
    popularVideos,
    averageRecentViews,
  } satisfies YouTubeRefreshResult;
}

async function getVideosByIds(videoIds: string) {
  if (!videoIds) {
    return [];
  }

  const payload = await youtubeFetch<YouTubeVideoItem>("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds,
    maxResults: 50,
  });

  return payload.items?.map(toVideo) ?? [];
}

export function formatIsoDuration(value: string) {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return "0:00";
  }

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);
  const paddedSeconds = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}
