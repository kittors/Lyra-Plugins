/**
 * Build `skills.json` from `skills-sources.json`.
 *
 * A skill collection is a git repository with a directory of `SKILL.md` folders in it, so unlike a
 * plugin there is nothing to wrap and nothing to publish — the index only has to say where each one
 * lives and what is in it. What it does have to do is *look inside*: a collection that says "eight
 * skills" and ships six has told the window a number nobody checked, and the window has no way to
 * find out until someone installs it.
 *
 * So each source is read at sync time and its skills are listed by name, from the directory itself.
 * Failure keeps the previous answer rather than dropping the entry: an index that loses a
 * collection because GitHub was briefly unreachable is worse than one that is a day stale.
 */

import { readFile, writeFile } from "node:fs/promises";

const OUT = new URL("../skills.json", import.meta.url);
const SOURCES = new URL("../skills-sources.json", import.meta.url);

const token = process.env.GITHUB_TOKEN;
const headers = {
	Accept: "application/vnd.github+json",
	"User-Agent": "lyra-skills-sync",
	...(token ? { Authorization: `Bearer ${token}` } : {}),
};

/** `https://github.com/owner/name` → `owner/name`. */
function repoSlug(homepage) {
	const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+)/.exec(homepage ?? "");
	return match ? `${match[1]}/${match[2]}` : null;
}

async function listSkills(source) {
	const slug = repoSlug(source.homepage);
	if (!slug) return null;
	const response = await fetch(`https://api.github.com/repos/${slug}/contents/${source.path}`, { headers });
	if (!response.ok) throw new Error(`${response.status}`);
	const items = await response.json();
	return items
		// A skill is a directory; loose files beside them are the collection's own notes.
		.filter((item) => item.type === "dir")
		.map((item) => item.name)
		.sort();
}

async function upstreamVersion(source) {
	const slug = repoSlug(source.homepage);
	if (!slug) return undefined;
	const response = await fetch(`https://api.github.com/repos/${slug}/releases/latest`, { headers });
	if (!response.ok) return undefined;
	const release = await response.json();
	return String(release.tag_name ?? "").replace(/^v/, "") || undefined;
}

const sources = JSON.parse(await readFile(SOURCES, "utf8"));
const previous = await readFile(OUT, "utf8").then(JSON.parse).catch(() => ({ collections: [] }));
const before = new Map((previous.collections ?? []).map((c) => [c.id, c]));

const notes = [];
const collections = [];

for (const source of sources.sources) {
	const kept = before.get(source.id);
	let skills = kept?.skills;
	let version = kept?.version;

	try {
		skills = (await listSkills(source)) ?? skills;
		version = (await upstreamVersion(source)) ?? version;
	} catch (error) {
		notes.push(`! ${source.id}：读不到上游（${error.message}），沿用已有的`);
	}

	collections.push({
		id: source.id,
		name: source.name,
		description: source.description,
		category: source.category,
		author: source.author,
		repository: source.repository,
		homepage: source.homepage,
		path: source.path,
		logo: source.logo ?? logoFor(source.homepage),
		brandColor: source.brandColor,
		...(version ? { version } : {}),
		skills: skills ?? [],
	});
}

/** The owner's avatar: every GitHub account has one, and it does not go stale. */
function logoFor(homepage) {
	const slug = repoSlug(homepage);
	return slug ? `https://github.com/${slug.split("/")[0]}.png?size=128` : undefined;
}

const out = {
	$comment: "由 scripts/sync-skills.mjs 生成，改 skills-sources.json 而不是这里。",
	name: sources.name,
	updatedAt: new Date().toISOString().slice(0, 10),
	collections,
};

await writeFile(OUT, `${JSON.stringify(out, null, "\t")}\n`);
for (const note of notes) console.log(note);
console.log(`✓ skills.json：${collections.length} 个集合，共 ${collections.reduce((n, c) => n + c.skills.length, 0)} 个技能`);
