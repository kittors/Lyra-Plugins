#!/usr/bin/env node
/**
 * Turn `sources.json` into `registry.json` and the wrappers under `plugins/`.
 *
 * The market is a mirror, not a warehouse. Every entry here belongs to somebody else and is
 * still being worked on by them, so the one thing this repository must never become is a stale
 * copy of nine other repositories. What it holds instead is the smallest thing that cannot be
 * derived: which upstreams are worth listing, and what to say about them in Chinese.
 *
 * Everything else is fetched. Versions come from the npm registry and from GitHub releases at
 * sync time, which is the only way a number in an index stays true — a version written by hand
 * is a version that was true once.
 *
 * Two kinds of upstream, because there are two kinds of thing:
 *
 *   `git-skills`  A repository that is already a bundle. It gets listed and nothing more; the
 *                 install clones it directly and Lyra reads its `skills/` as it finds them, so
 *                 the user always gets that project's current state rather than our snapshot.
 *
 *   `npm-mcp`     A published server with no repository to clone. This is where a wrapper is
 *                 unavoidable: an MCP server is a command line, and somebody has to write down
 *                 which command. The wrapper is a manifest and a `.mcp.json`, both generated,
 *                 both pinned to `@latest` so the wrapper does not become the stale part.
 *
 *   `npm-cli`     A command line tool plus instructions for using it. Same wrapper, minus the
 *                 server declaration — what ships is a skill telling the agent how to drive it.
 *
 * Run with `--check` in CI to fail instead of writing, which is what keeps a hand-edited
 * `registry.json` from surviving review.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

/** Give an unreachable upstream a chance, then move on: a flaky network must not empty the index. */
const TIMEOUT_MS = 15_000;

async function main() {
	const sources = JSON.parse(await readFile(join(ROOT, "sources.json"), "utf8"));
	const entries = [];
	const wrappers = new Map();
	const notes = [];

	for (const source of sources.sources) {
		const upstream = await describe(source, notes);
		entries.push(buildEntry(source, upstream));
		if (source.kind !== "git-skills") {
			for (const [path, body] of buildWrapper(source, upstream)) wrappers.set(path, body);
		}
	}

	const registry = {
		$comment: "由 scripts/sync.mjs 从 sources.json 生成，不要手改。",
		name: sources.name,
		updatedAt: new Date().toISOString().slice(0, 10),
		plugins: entries,
	};

	const files = new Map([["registry.json", `${JSON.stringify(registry, null, 2)}\n`], ...wrappers]);

	let drift = 0;
	for (const [path, body] of files) {
		const current = await readFile(join(ROOT, path), "utf8").catch(() => null);
		if (current === body) continue;
		drift++;
		if (CHECK) {
			console.error(`× ${path} 与 sources.json 不同步`);
			continue;
		}
		await mkdir(dirname(join(ROOT, path)), { recursive: true });
		await writeFile(join(ROOT, path), body);
		console.log(`✓ ${path}`);
	}

	// A wrapper whose source was deleted would otherwise sit there forever, installable.
	if (!CHECK) await pruneWrappers(sources.sources);

	for (const note of notes) console.log(`  ${note}`);

	if (CHECK && drift > 0) {
		console.error(`\n${drift} 个文件需要重新生成：node scripts/sync.mjs`);
		process.exit(1);
	}
	console.log(drift === 0 ? "\n已是最新。" : `\n更新了 ${drift} 个文件。`);
}

/**
 * What the upstream says about itself right now.
 *
 * Failure is a note, not an exception. An index that drops an entry because npm was briefly
 * unreachable is worse than one carrying a version number that is a day old.
 */
async function describe(source, notes) {
	try {
		if (source.kind === "git-skills") return await fromGitHub(source);
		return await fromNpm(source);
	} catch (error) {
		notes.push(`! ${source.id}：取不到上游信息（${error.message}），沿用已有的`);
		return {};
	}
}

async function fromNpm(source) {
	const response = await fetch(`https://registry.npmjs.org/${source.package}/latest`, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { accept: "application/json", "user-agent": "lyra-plugins-sync" },
	});
	if (!response.ok) throw new Error(`npm 返回 ${response.status}`);
	const data = await response.json();
	return { version: data.version, upstreamDescription: data.description };
}

async function fromGitHub(source) {
	const repo = /github\.com\/([^/]+\/[^/.]+)/.exec(source.repository ?? source.homepage ?? "")?.[1];
	if (!repo) throw new Error("认不出 GitHub 仓库");

	const headers = {
		accept: "application/vnd.github+json",
		"user-agent": "lyra-plugins-sync",
		...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
	};
	const release = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers,
	});
	// No releases is normal for a skill collection; the repository is still perfectly installable.
	if (release.status === 404) return {};
	if (!release.ok) throw new Error(`GitHub 返回 ${release.status}`);
	const data = await release.json();
	return { version: String(data.tag_name ?? "").replace(/^v/, "") || undefined };
}

/**
 * What the app calls this kind of thing.
 *
 * The `kind` in sources.json says how the upstream is *distributed* — an npm package, a git
 * repository of skills — which is this script's concern and nobody else's. The app asks a different
 * question: is this a bundle of skills it loads, or a server declaration it has to write into
 * settings and start. Answering it here means the index states it rather than leaving the window to
 * infer it from whether a `package` field happens to be present.
 */
function bundleKind(kind) {
	return kind === "git-skills" ? "plugin" : "mcp";
}

function buildEntry(source, upstream) {
	const entry = {
		id: source.id,
		name: source.name,
		description: source.description,
		category: source.category,
		kind: bundleKind(source.kind),
		repository: source.kind === "git-skills" ? source.repository : REPOSITORY,
		homepage: source.homepage,
		author: source.author,
		logo: source.logo,
		brandColor: source.brandColor,
	};
	if (source.kind !== "git-skills") entry.path = `plugins/${source.id}`;
	if (upstream.version) entry.version = upstream.version;
	if (source.kind !== "git-skills") entry.package = source.package;
	return entry;
}

/** This repository, as the place wrapped bundles are cloned from. */
const REPOSITORY = "https://github.com/kittors/Lyra-Plugins.git";

function buildWrapper(source, upstream) {
	const files = [];
	const base = `plugins/${source.id}`;

	const manifest = {
		name: source.id,
		version: upstream.version ?? "0.0.0",
		description: source.description,
		author: { name: source.author },
		homepage: source.homepage,
		interface: {
			displayName: source.name,
			shortDescription: source.description,
			longDescription: source.longDescription,
			developerName: source.author,
			category: source.category,
			brandColor: source.brandColor,
			websiteURL: source.homepage,
			defaultPrompt: source.prompts ?? [],
		},
	};
	if (source.kind === "npm-mcp") manifest.mcpServers = ".mcp.json";
	files.push([`${base}/.lyra-plugin/plugin.json`, `${JSON.stringify(manifest, null, 2)}\n`]);

	if (source.kind === "npm-mcp") {
		const mcp = {
			mcpServers: {
				[source.id]: { command: source.command, args: source.args },
			},
		};
		files.push([`${base}/.mcp.json`, `${JSON.stringify(mcp, null, 2)}\n`]);
	}

	if (source.kind === "npm-cli") {
		files.push([`${base}/skills/${source.id}/SKILL.md`, skillFor(source, upstream)]);
	}

	return files;
}

/**
 * The skill that ships with a command-line upstream.
 *
 * Written from `sources.json` rather than kept as a file, so the prompt text and the card text
 * cannot drift apart — they are the same sentences, rendered twice.
 */
function skillFor(source, upstream) {
	const install = `npm i -g ${source.package}`;
	return `---
name: ${source.id}
description: ${source.description}
---

# ${source.name}

${source.longDescription ?? source.description}

## 前置

这个技能驱动的是一个命令行工具，需要先装上：

\`\`\`bash
${install}
\`\`\`

当前上游版本 ${upstream.version ?? "未知"}。详细用法见 <${source.homepage}>。

## 用法

先跑 \`${binOf(source)} --help\` 看当前版本提供了哪些命令，再按目标选最贴近的那个执行。
不要在每次任务开始时做健康检查——直接执行目标命令，失败了再排查。

## 什么时候用它

${(source.prompts ?? []).map((p) => `- ${p}`).join("\n")}
`;
}

function binOf(source) {
	return source.package.split("/").pop();
}

async function pruneWrappers(sources) {
	const keep = new Set(sources.filter((s) => s.kind !== "git-skills").map((s) => s.id));
	const { readdir } = await import("node:fs/promises");
	const existing = await readdir(join(ROOT, "plugins"), { withFileTypes: true }).catch(() => []);
	for (const entry of existing) {
		if (!entry.isDirectory() || keep.has(entry.name)) continue;
		await rm(join(ROOT, "plugins", entry.name), { recursive: true, force: true });
		console.log(`− plugins/${entry.name}（已从 sources.json 移除）`);
	}
}

// Unused today; kept because the next thing this script will want is content addressing.
export const digest = (text) => createHash("sha256").update(text).digest("hex").slice(0, 12);

await main();
