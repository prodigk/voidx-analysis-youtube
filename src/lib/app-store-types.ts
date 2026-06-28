import type { YouTubeChannelStats } from "@/lib/youtube";

export type SavedChannel = {
  id: string;
  channel: YouTubeChannelStats;
  favorite: boolean;
  savedAt: string;
  updatedAt: string;
};

export type TitleCandidate = {
  id: string;
  title: string;
  score: number;
  memo: string;
};

export type SavedVideoPlan = {
  id: string;
  title: string;
  categoryName: string;
  topic: string;
  book: string;
  tone: string;
  audience: string;
  thumbnailMemo: string;
  titleCandidates: TitleCandidate[];
  createdAt: string;
  updatedAt: string;
};

export type AppStoreData = {
  channels: SavedChannel[];
  videoPlans: SavedVideoPlan[];
};
