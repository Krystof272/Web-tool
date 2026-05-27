export type ProductionStatus = 'ready' | 'dubbing' | 'subtitles' | 'published';

export type ColumnKey = 'title' | 'status' | 'lang' | 'tags' | 'notes';

export type ColumnWidths = Record<ColumnKey, number>;

export interface Video {
  id: string;
  title: string;
  creator: string;
  app: string;
  language: string;
  videoUrl?: string;
  tags: string;
  notes: string;
  isDubbing: boolean;
  isSubtitles: boolean;
  isPublished: boolean;
  createdAt: number;
}

export interface Invoice {
  id: string;
  creator: string;
  app: string;
  date: string;
  isReceived: boolean;
  isPaid: boolean;
}

export interface AppConfig {
  selectedApps: string[];
  creators: string[];
}

export interface TagConfig {
  name: string;
  color: string;
}
