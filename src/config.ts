import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { SearchDepth } from "./types.js";

export const SEARCH_DEPTHS = ["basic", "advanced", "fast", "ultra-fast"] as const;
const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const MIN_REQUEST_TIMEOUT_MS = 100;
const MAX_REQUEST_TIMEOUT_MS = 120_000;

export function isSearchDepth(value: unknown): value is SearchDepth {
  return typeof value === "string" && SEARCH_DEPTHS.includes(value as SearchDepth);
}

export function getAgentDir(): string {
  return process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
}

export function getApiKey(): string | undefined {
  const fromEnv = process.env.TAVILY_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  for (const path of [join(getAgentDir(), "tavily-api-key"), join(homedir(), ".tavily-api-key")]) {
    try {
      const key = readFileSync(path, "utf8").trim();
      if (key) return key;
    } catch {
      // Continue to the next configured key source.
    }
  }
  return undefined;
}

export function getConfigPath(): string {
  return join(getAgentDir(), "tavily-search.json");
}

export function getDefaultSearchDepth(): SearchDepth {
  const fromEnv = process.env.TAVILY_SEARCH_DEPTH?.trim();
  if (isSearchDepth(fromEnv)) return fromEnv;
  try {
    const config = JSON.parse(readFileSync(getConfigPath(), "utf8")) as { search_depth?: unknown };
    if (isSearchDepth(config.search_depth)) return config.search_depth;
  } catch {
    // Invalid configuration falls back to the safe default.
  }
  return "basic";
}

export function getRequestTimeoutMs(): number {
  const configured = Number(process.env.TAVILY_REQUEST_TIMEOUT_MS);
  if (!Number.isFinite(configured)) return DEFAULT_REQUEST_TIMEOUT_MS;
  return Math.min(Math.max(Math.floor(configured), MIN_REQUEST_TIMEOUT_MS), MAX_REQUEST_TIMEOUT_MS);
}

export function setDefaultSearchDepth(depth: SearchDepth): void {
  const agentDir = getAgentDir();
  const path = getConfigPath();
  const temporaryPath = join(agentDir, `.tavily-search.${process.pid}.${Date.now()}.tmp`);
  mkdirSync(agentDir, { recursive: true });
  try {
    writeFileSync(temporaryPath, `${JSON.stringify({ search_depth: depth }, null, 2)}\n`, {
      mode: 0o600,
      flag: "wx",
    });
    renameSync(temporaryPath, path);
  } catch (error) {
    rmSync(temporaryPath, { force: true });
    throw error;
  }
}
