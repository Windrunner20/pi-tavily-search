export type SearchDepth = "basic" | "advanced" | "fast" | "ultra-fast";

export interface TavilySearchResult {
  title?: unknown;
  url?: unknown;
  content?: unknown;
  raw_content?: unknown;
  score?: unknown;
  published_date?: unknown;
}

export interface TavilySearchResponse {
  query?: unknown;
  answer?: unknown;
  results?: unknown;
  images?: unknown;
  response_time?: unknown;
  request_id?: unknown;
}

export interface TavilyToolDetails {
  query: string;
  sources: Array<{ url?: string; score?: number }>;
  resultCount: number;
  responseTime?: number;
  requestId?: string;
  searchDepth: SearchDepth;
  requestedRawContent: boolean;
  digestTruncated: boolean;
  outputBytes: number;
  remainingTurnOutputBytes: number;
  fullOutputPath?: string;
  skipped?: "turn_output_budget_exhausted";
}
