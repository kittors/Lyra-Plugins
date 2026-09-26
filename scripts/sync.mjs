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
 *   `pypi-mcp`    A server published to PyPI, started with `uvx`. The same wrapper as `npm-mcp`;
 *                 the version comes from PyPI.
 *
 *   `remote-mcp`  A server somebody else runs, reached over Streamable HTTP (or SSE). The wrapper
 *                 is a `.mcp.json` with a URL. There is no package, so no version to report.
 *
 * A server that needs something from whoever installs it — an API key, a token, a connection
 * string — lists it under `env` in sources.json: a name, a sentence, where to get one. The wrapper
 * then carries `${NAME}` where the value goes (an env value for a local server, a header for a
 * remote one) and the manifest carries the sentence; Lyra asks for the value after installing and
 * keeps it in its vault. The index repeats the list as `needs`, so the market can say "needs a key"
 * before anything is installed.
 *
 * Run with `--check` in CI to fail instead of writing, which is what keeps a hand-edited
 * `registry.json` from surviving review.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
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
		if (!listedDirectly(source.kind)) {
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
		if (source.kind === "git-skills" || source.kind === "skill-collection") return await fromGitHub(source);
		if (source.kind === "remote-mcp") return {};
		if (source.kind === "pypi-mcp") return await fromPyPI(source);
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

async function fromPyPI(source) {
	const response = await fetch(`https://pypi.org/pypi/${source.package}/json`, {
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { accept: "application/json", "user-agent": "lyra-plugins-sync" },
	});
	if (!response.ok) throw new Error(`PyPI 返回 ${response.status}`);
	const data = await response.json();
	return { version: data.info?.version, upstreamDescription: data.info?.summary };
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
	return { version: cleanTag(String(data.tag_name ?? "")) };
}

/**
 * A release tag reduced to the version inside it.
 *
 * A repository that publishes more than one thing tags them `<name>-v3.22.1`, and a card that
 * repeats the plugin's own name in the version field is showing an identifier, not a version. The
 * prefix is only stripped when a version-looking remainder is left, so a tag that happens not to
 * carry one is passed through rather than mangled into nothing.
 */
function cleanTag(tag) {
	const trimmed = tag.trim();
	const match = /(?:^|-)v?(\d+(?:\.\d+)*(?:[-+][0-9A-Za-z.-]+)?)$/.exec(trimmed);
	if (match) return match[1];
	return trimmed.replace(/^v/, "") || undefined;
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
	if (kind === "skill-collection") return "skill";
	return kind === "git-skills" || kind === "npm-cli" ? "plugin" : "mcp";
}

/** Whether the upstream is listed as it is (cloned directly) rather than wrapped here. */
function listedDirectly(kind) {
	return kind === "git-skills" || kind === "skill-collection";
}

function buildEntry(source, upstream) {
	const direct = listedDirectly(source.kind);
	const entry = {
		id: source.id,
		name: source.name,
		description: source.description,
		category: source.category,
		kind: bundleKind(source.kind),
		repository: direct ? source.repository : REPOSITORY,
		homepage: source.homepage,
		author: source.author,
		logo: logoFor(source, direct),
		brandColor: source.brandColor,
	};
	if (source.tagline) entry.tagline = source.tagline;
	if (source.keywords?.length) entry.keywords = source.keywords;
	if (source.license) entry.license = source.license;
	if (direct && source.path) entry.path = source.path;
	if (!direct) entry.path = `plugins/${source.id}`;
	if (upstream.version) entry.version = upstream.version;
	if (!direct && source.package) entry.package = source.package;
	if (source.env?.length) entry.needs = source.env.map((need) => ({ name: need.name, description: need.description, url: need.url, ...(isOptional(need) ? { optional: true } : {}) }));
	return entry;
}

/**
 * The entry's picture, as a URL — the wrapper's own `icon.svg`/`icon.webp`, or for an upstream listed
 * directly the one kept in `icons/`. Never `github.com/<owner>.png`: that is a person's face offered as a
 * product's mark, and it makes every entry from one owner look the same.
 */
function logoFor(source, direct) {
	for (const extension of ["svg", "webp", "png"]) {
		const own = direct ? `icons/${source.id}.${extension}` : `plugins/${source.id}/.lyra-plugin/icon.${extension}`;
		if (existsSync(join(ROOT, own))) return `https://raw.githubusercontent.com/kittors/Lyra-Plugins/main/${own}`;
	}
	return undefined;
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
	const serves = source.kind === "npm-mcp" || source.kind === "pypi-mcp" || source.kind === "remote-mcp";
	if (source.license) manifest.license = source.license;
	if (source.keywords?.length) manifest.keywords = source.keywords;
	if (serves) manifest.mcpServers = ".mcp.json";
	// What each placeholder is, for the screen where it is filled in. See `mcp/placeholders.ts` in Lyra.
	if (source.env?.length) {
		manifest.env = source.env.map((need) => ({
			name: need.name,
			...(need.description ? { description: need.description } : {}),
			...(need.url ? { url: need.url } : {}),
			...(typeof need.secret === "boolean" ? { secret: need.secret } : {}),
			...(isOptional(need) ? { optional: true } : {}),
		}));
	}
	files.push([`${base}/.lyra-plugin/plugin.json`, `${JSON.stringify(manifest, null, 2)}\n`]);

	if (serves) {
		const mcp = { mcpServers: { [source.id]: serverFor(source) } };
		files.push([`${base}/.mcp.json`, `${JSON.stringify(mcp, null, 2)}\n`]);
	}

	if (source.kind === "npm-cli") {
		files.push([`${base}/skills/${source.id}/SKILL.md`, skillFor(source, upstream)]);
	}

	return files;
}

/** `optional: true`, or `required: false` — sources.json has been written both ways. */
function isOptional(need) {
	return need.optional === true || need.required === false;
}

/**
 * One server declaration, in the `.mcp.json` shape Claude Code and Lyra both read.
 *
 * A local server gets each `env` name as `${NAME}` in its environment, unless the source already
 * put the placeholder somewhere else (an argument, say) — then the environment is left alone. A
 * remote server gets its headers as written in sources.json, placeholders and all.
 */
function serverFor(source) {
	if (source.kind === "remote-mcp") {
		const server = { type: source.transport === "sse" ? "sse" : "http", url: source.url };
		if (source.headers && Object.keys(source.headers).length > 0) server.headers = source.headers;
		return server;
	}
	const server = {
		command: source.command ?? (source.kind === "pypi-mcp" ? "uvx" : "npx"),
		args: source.args,
	};
	const written = JSON.stringify(server.args ?? []);
	const env = {};
	// An optional value is left out rather than templated: unset is its default, and a placeholder
	// nobody filled would reach the server as an empty string rather than as "not set".
	for (const need of source.env ?? []) if (!isOptional(need) && !written.includes(`\${${need.name}}`)) env[need.name] = `\${${need.name}}`;
	for (const [name, value] of Object.entries(source.staticEnv ?? {})) env[name] = value;
	if (Object.keys(env).length > 0) server.env = env;
	return server;
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
	const keep = new Set(sources.filter((s) => !listedDirectly(s.kind)).map((s) => s.id));
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
