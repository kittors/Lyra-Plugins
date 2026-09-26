/**
 * Put sources.json on the market platform: build each entry there, give it the Chinese name, line,
 * category and colour written here, approve it, and give it its official logo from icons/.
 *
 * sync.mjs keeps this repository in step with upstream, and the platform refreshes what it already
 * lists every hour. Neither of them lists something new — a source added here reaches the platform
 * only when somebody submits it, and this is that somebody.
 *
 *     node scripts/publish.mjs                  # everything
 *     node scripts/publish.mjs --only exa,time  # just these
 *     node scripts/publish.mjs --dry            # print what would be submitted
 *
 * Signs in with the maintainer token from ~/.config/lyra-registry/admin-token (or the file named by
 * REGISTRY_TOKEN_FILE). The token is never printed. MARKET points it somewhere other than the live
 * platform — a local `wrangler dev`, for a rehearsal.
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MARKET = (process.env.MARKET ?? "https://market.07230805.xyz").replace(/\/$/, "");
const WRAPPERS = "https://github.com/kittors/Lyra-Plugins";

const argv = process.argv.slice(2);
const only = argv.includes("--only") ? new Set((argv[argv.indexOf("--only") + 1] ?? "").split(",").filter(Boolean)) : null;
const dry = argv.includes("--dry");

/** Listed as they are, cloned from upstream — as opposed to wrapped under plugins/. */
const direct = (source) => source.kind === "git-skills" || source.kind === "skill-collection";

function submission(source) {
	const kind = source.kind === "skill-collection" ? "skill" : source.kind === "git-skills" || source.kind === "npm-cli" ? "plugin" : "mcp";
	return {
		id: source.id,
		repository: direct(source) ? source.repository.replace(/\.git$/, "") : WRAPPERS,
		path: direct(source) ? (source.path ?? "") : `plugins/${source.id}`,
		kind,
		name: source.name,
		description: source.description,
		category: source.category,
	};
}

/**
 * What a maintainer sets by hand, and the platform then keeps through every rebuild.
 *
 * Keywords only for upstreams listed directly: a wrapper carries its own in the manifest sync.mjs
 * writes, and claiming them here would freeze them against later edits to sources.json.
 */
function curation(source) {
	const edits = { name: source.name, description: source.description, category: source.category };
	if (source.brandColor) edits.brandColor = source.brandColor;
	if (direct(source) && source.keywords?.length) edits.keywords = source.keywords;
	return edits;
}

async function signIn() {
	const file = process.env.REGISTRY_TOKEN_FILE ?? join(homedir(), ".config", "lyra-registry", "admin-token");
	const token = readFileSync(file, "utf8").trim();
	const response = await fetch(`${MARKET}/auth/token`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ token }),
	});
	if (!response.ok) throw new Error(`登录失败：${response.status} ${await response.text()}`);
	const session = /lyra_session=([^;]+)/.exec(response.headers.get("set-cookie") ?? "")?.[1];
	if (!session) throw new Error("登录成功但没拿到会话");
	return decodeURIComponent(session);
}

async function call(session, method, path, body) {
	const response = await fetch(`${MARKET}${path}`, {
		method,
		headers: { authorization: `Bearer ${session}`, "content-type": "application/json" },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const text = await response.text();
	try {
		return { status: response.status, data: JSON.parse(text) };
	} catch {
		return { status: response.status, data: { raw: text.slice(0, 300) } };
	}
}

/**
 * The entry's official logo, from icons/ — for every entry the platform is not already showing an
 * icon of the bundle's own for.
 *
 * A wrapper ships the same logo inside itself (`.lyra-plugin/icon.*`), which the platform reads at
 * build time, so it arrives here as `bundled` and is left alone. So is an upstream that ships its
 * own, like Superpowers: the author's picture wins over ours. An entry showing nothing, or showing a
 * maintainer upload, gets the file in icons/ — uploading again when one was uploaded before is what
 * lets a better logo committed here replace the old one on the next run.
 */
async function placeIcon(session, source) {
	const detail = await call(session, "GET", `/v1/entries/${encodeURIComponent(source.id)}`);
	const now = (detail.data?.entry ?? detail.data)?.iconSource ?? "?";
	if (now !== "none" && now !== "uploaded") return now;
	const found = ["svg", "png"].map((extension) => join(ROOT, "icons", `${source.id}.${extension}`)).find((file) => existsSync(file));
	if (!found) return now;
	const response = await fetch(`${MARKET}/v1/admin/entries/${encodeURIComponent(source.id)}/icon`, {
		method: "PUT",
		headers: { authorization: `Bearer ${session}`, "content-type": found.endsWith(".svg") ? "image/svg+xml" : "image/png" },
		body: readFileSync(found),
	});
	return response.ok ? "uploaded（已换成官方 logo）" : `上传失败 ${response.status}`;
}

const sources = JSON.parse(readFileSync(join(ROOT, "sources.json"), "utf8")).sources.filter((source) => !only || only.has(source.id));
if (dry) {
	for (const source of sources) console.log(JSON.stringify({ submit: submission(source), curate: curation(source) }));
	process.exit(0);
}

const session = await signIn();
let listed = 0;
for (const source of sources) {
	process.stdout.write(`${source.id.padEnd(30)} `);
	const built = await call(session, "POST", "/v1/entries", submission(source));
	if (built.status !== 200 || built.data?.ok === false) {
		console.log(`✗ 构建 ${built.status} ${JSON.stringify(built.data).slice(0, 200)}`);
		continue;
	}
	const edit = await call(session, "PATCH", `/v1/admin/entries/${encodeURIComponent(source.id)}`, curation(source));
	const review = await call(session, "POST", `/v1/admin/entries/${encodeURIComponent(source.id)}/review`, { action: "approve" });
	const icon = await placeIcon(session, source);
	const warnings = built.data?.warnings?.length ? `（${built.data.warnings.join("；").slice(0, 120)}）` : "";
	console.log(`✓ ${built.data?.version ?? ""} 编辑 ${edit.status} 上架 ${review.status} 图标 ${icon}${warnings}`);
	if (review.status === 200) listed++;
	// Every build downloads a repository from GitHub; a pause keeps a full run polite.
	await new Promise((resolve) => setTimeout(resolve, 800));
}
console.log(`\n上架 ${listed}/${sources.length}`);
