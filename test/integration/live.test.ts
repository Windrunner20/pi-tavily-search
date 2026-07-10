import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import test from "node:test";
import registerTavilySearch from "../../extensions/index.js";

const apiKey = process.env.TAVILY_API_KEY?.trim();

test("live Tavily search stays within the v1 context budget", { skip: !apiKey }, async () => {
  let tool: any;
  const handlers = new Map<string, Array<(event: any, ctx: any) => any>>();
  registerTavilySearch({
    registerTool(definition: any) { tool = definition; },
    registerCommand() {},
    on(name: string, handler: (event: any, ctx: any) => any) {
      handlers.set(name, [...(handlers.get(name) ?? []), handler]);
    },
  } as never);
  for (const handler of handlers.get("turn_start") ?? []) await handler({}, {});
  const result = await tool.execute("live", {
    query: "Tavily Search API official documentation",
    search_depth: "basic",
    max_results: 5,
    include_answer: true,
    include_raw_content: true,
  });
  const text = result.content[0].text as string;
  assert.ok(Buffer.byteLength(text, "utf8") <= 8 * 1024);
  assert.match(text, /Untrusted external web content/);
  assert.ok(result.details.fullOutputPath);
  const artifact = JSON.parse(await readFile(result.details.fullOutputPath, "utf8"));
  assert.ok(Array.isArray(artifact.response.results));
  await rm(result.details.fullOutputPath.replace(/\/result\.json$/, ""), { recursive: true, force: true });
});
