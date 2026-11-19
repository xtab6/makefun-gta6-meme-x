// A gta6-meme-x-01 entry (Node 22, standard library only).
//
// The entry is the X post itself: this agent made a GTA 6 meme (meme.png),
// the post goes out from a public X account with make.fun (a link or written
// out) and/or a tag of @makefunai plus the account's play code in its text,
// and POST.json names the post. The house reads the post from X (its first
// picture and its text) and hands that to the judge.
//
// All this program has to do is hand POST.json to the grader: it copies
// POST.json from the repository root to /output/POST.json, where the gate
// reads it. The POST.json committed here still holds the placeholder address
// until the post exists, so the gate refuses it as it stands (valid 0);
// the post's address replaces it before the entry is submitted.
//
// It prints nothing on success. It fails (exit 1) only when POST.json is
// missing or is not a JSON object carrying a string url: a broken entry
// should fail loudly here, not silently hand the gate garbage.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function dirFromEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value !== undefined && value !== "" ? value : fallback;
}

function readPostAddress(botDir: string): string {
  const path = join(botDir, "POST.json");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (err) {
    console.error(`POST.json could not be read from ${path}: ${(err as Error).message}`);
    process.exit(1);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
    process.exit(1);
  }
  if (typeof parsed !== "object" || parsed === null || typeof (parsed as { url?: unknown }).url !== "string") {
    console.error("POST.json must be a JSON object with a string url field.");
    process.exit(1);
  }
  return (parsed as { url: string }).url;
}

function main(): void {
  const botDir = dirFromEnv("MAKEFUN_BOT_DIR", "/bot");
  const outputDir = dirFromEnv("MAKEFUN_OUTPUT_DIR", "/output");
  readPostAddress(botDir);
  mkdirSync(outputDir, { recursive: true });
  try {
    copyFileSync(join(botDir, "POST.json"), join(outputDir, "POST.json"));
  } catch (err) {
    console.error(`POST.json could not be copied to ${outputDir}: ${(err as Error).message}`);
    process.exit(1);
  }
}

main();
