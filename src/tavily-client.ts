import type { SearchDepth, TavilySearchResponse } from "./types.js";

const SEARCH_ENDPOINT = "https://api.tavily.com/search";
const MAX_RESPONSE_BYTES = 32 * 1024 * 1024;

function createDeadlineSignal(
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup(): void } {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Tavily request timed out after ${timeoutMs}ms.`));
  }, timeoutMs);
  const abortFromParent = () => controller.abort(parentSignal?.reason);
  if (parentSignal?.aborted) abortFromParent();
  else parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeout);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

async function readResponseText(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(`Tavily response exceeded the ${Math.floor(maxBytes / 1024 / 1024)}MB safety limit.`);
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`Tavily response exceeded the ${Math.floor(maxBytes / 1024 / 1024)}MB safety limit.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(output);
}

export interface SearchRequest {
  query: string;
  searchDepth: SearchDepth;
  maxResults: number;
  includeAnswer: boolean;
  includeRawContent: boolean;
  includeImages: boolean;
}

export async function searchTavily(
  apiKey: string,
  request: SearchRequest,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<TavilySearchResponse> {
  const deadline = createDeadlineSignal(signal, timeoutMs);
  try {
    const response = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: request.query,
        search_depth: request.searchDepth,
        max_results: request.maxResults,
        include_answer: request.includeAnswer,
        include_raw_content: request.includeRawContent ? "markdown" : false,
        include_images: request.includeImages,
      }),
      signal: deadline.signal,
    });

    const responseText = await readResponseText(response, MAX_RESPONSE_BYTES);
    if (!response.ok) {
      throw new TavilyHttpError(response.status, response.statusText, responseText);
    }

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error("Tavily returned an invalid JSON response.", { cause: error });
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Tavily returned an invalid JSON response.");
    }
    return data as TavilySearchResponse;
  } finally {
    deadline.cleanup();
  }
}

export class TavilyHttpError extends Error {
  constructor(
    readonly status: number,
    readonly statusText: string,
    readonly responseBody: string,
  ) {
    super(`Tavily search failed: HTTP ${status} ${statusText}`.trim());
    this.name = "TavilyHttpError";
  }
}
