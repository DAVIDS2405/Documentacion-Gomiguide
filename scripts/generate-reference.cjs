#!/usr/bin/env node
/**
 * Genera las páginas de referencia de la documentación a partir del código real.
 *
 *   FRONT=/ruta/gomiguide-frontend BACK=/ruta/gomiguide-backend node scripts/generate-reference.cjs
 *
 * Qué extrae:
 *  - Front: métodos de `api` (src/lib/api.ts), llamadas fetch sueltas, rutas de Next (src/app),
 *    y qué pantallas alcanzan cada llamada siguiendo imports estáticos y dinámicos.
 *  - Back: rutas Express (src/routes/**) con su prefijo de montaje y su auth, y modelos Prisma.
 *  - Cruce: qué endpoints del front existen o no en las rutas del back.
 *
 * Requiere `typescript` disponible en el front (node_modules del front).
 */
const fs = require("fs");
const path = require("path");

const FRONT = process.env.FRONT;
const BACK = process.env.BACK;
if (!FRONT || !BACK) {
	console.error("Define FRONT y BACK con la ruta de cada repo.");
	process.exit(1);
}
const ts = require(require.resolve("typescript", { paths: [FRONT] }));
const OUT = path.join(__dirname, "..", "src", "content", "docs", "referencia");
fs.mkdirSync(OUT, { recursive: true });

const walk = (dir, re) => {
	const out = [];
	if (!fs.existsSync(dir)) return out;
	for (const f of fs.readdirSync(dir)) {
		const p = path.join(dir, f);
		if (fs.statSync(p).isDirectory()) out.push(...walk(p, re));
		else if (re.test(f)) out.push(p);
	}
	return out;
};
const parse = (f) =>
	ts.createSourceFile(
		f,
		fs.readFileSync(f, "utf8"),
		ts.ScriptTarget.Latest,
		true,
		f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
const relF = (p) => path.relative(FRONT, p);

/* ───────────────────────── FRONT ───────────────────────── */

const cfg = ts.readConfigFile(path.join(FRONT, "tsconfig.json"), ts.sys.readFile).config;
const opts = ts.parseJsonConfigFileContent(cfg, ts.sys, FRONT).options;
const srcFiles = walk(path.join(FRONT, "src"), /\.(ts|tsx)$/);

const resolve = (spec, from) => {
	const r = ts.resolveModuleName(spec, from, opts, ts.sys).resolvedModule;
	return r && !r.isExternalLibraryImport ? r.resolvedFileName : null;
};

// Grafo de imports (estáticos, re-exports y import() dinámico)
const imports = {};
for (const f of srcFiles) {
	const sf = parse(f);
	const list = [];
	const visit = (n) => {
		if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier) {
			const r = resolve(n.moduleSpecifier.text, f);
			if (r) list.push(r);
		}
		if (
			ts.isCallExpression(n) &&
			n.expression.kind === ts.SyntaxKind.ImportKeyword &&
			n.arguments[0] &&
			ts.isStringLiteralLike(n.arguments[0])
		) {
			const r = resolve(n.arguments[0].text, f);
			if (r) list.push(r);
		}
		ts.forEachChild(n, visit);
	};
	visit(sf);
	imports[f] = list;
}

// Convierte un template de la API en ruta: ${id} tras "/" es parámetro; ${query} pegado a un segmento se descarta.
const templateToPath = (raw) => {
	let t = raw.replace(/^`|`$|^"|"$/g, "");
	t = t.replace(/(?<!\/)\$\{.*$/s, ""); // ${query ...} pegado al segmento: es query, no ruta
	t = t.replace(/\?.*$/s, "");
	t = t.replace(/(\/?)\$\{([^}]*)\}/g, (m, slash, expr) => {
		if (!slash) return "";
		const id = expr.trim();
		if (/packId/i.test(id)) return "/:packId";
		if (/subcategoryId/i.test(id)) return "/:subcategoryId";
		if (/iso|country/i.test(id)) return "/:iso";
		return "/:id";
	});
	return t;
};
// Métodos de `api` → endpoint
const apiFile = path.join(FRONT, "src/lib/api.ts");
const apiSf = parse(apiFile);
const endpoints = {};
apiSf.forEachChild((n) => {
	if (!ts.isVariableStatement(n)) return;
	const decl = n.declarationList.declarations[0];
	if (decl.name.getText(apiSf) !== "api") return;
	let obj = decl.initializer;
	if (obj.kind === ts.SyntaxKind.AsExpression) obj = obj.expression;
	for (const p of obj.properties) {
		if (!ts.isPropertyAssignment(p)) continue;
		const name = p.name.getText(apiSf);
		let method = "GET";
		let url = null;
		let auth = "público";
		const visit = (x) => {
			if (ts.isCallExpression(x) && /^apiRequest(Public)?$/.test(x.expression.getText(apiSf))) {
				auth = x.expression.getText(apiSf) === "apiRequest" ? "Bearer (admin)" : "público";
				url = templateToPath(x.arguments[0].getText(apiSf));
				const last = x.arguments[x.arguments.length - 1];
				if (last && ts.isObjectLiteralExpression(last))
					for (const pr of last.properties)
						if (ts.isPropertyAssignment(pr) && pr.name.getText(apiSf) === "method")
							method = pr.initializer.getText(apiSf).replace(/"/g, "");
			}
			ts.forEachChild(x, visit);
		};
		visit(p.initializer);
		endpoints[name] = { method, path: url, auth, file: relF(apiFile) };
	}
});

// Métodos que usan fetch() directo (CSV) en vez de apiRequest
for (const [name, e] of Object.entries(endpoints)) {
	if (e.path) continue;
	const fnText = apiSf.text.slice(apiSf.text.indexOf(name + ":"), apiSf.text.indexOf(name + ":") + 900);
	const m = fnText.match(/fetch\(\s*`\$\{API_URL\}([^`]+)`/);
	if (m) e.path = templateToPath("`" + m[1] + "`");
	if (/method:\s*"POST"/.test(fnText)) e.method = "POST";
}
// Uso de api.X y fetch sueltos por archivo
const apiUsage = {};
const rawFetch = [];
for (const f of srcFiles) {
	const text = fs.readFileSync(f, "utf8");
	for (const m of text.matchAll(/\bapi\.([a-zA-Z]+)\b/g)) {
		if (endpoints[m[1]]) (apiUsage[m[1]] ??= new Set()).add(f);
	}
}
// Llamadas fetch fuera de api.ts (rutas que no pasan por el cliente central)
const RAW = [
	{ method: "GET", path: "/api/v1/places", fn: "fetchPlaces", file: "src/lib/places-api.ts" },
	{ method: "GET", path: "/api/v1/packs/:packId/card-schema", fn: "fetchCardSchema", file: "src/lib/places-api.ts" },
	{ method: "GET", path: "/api/v1/categories", fn: "fetchCategories", file: "src/views/MapPage/sections/SideBar/hooks/useSubcategories.ts" },
];
for (const r of RAW) rawFetch.push({ ...r, abs: path.join(FRONT, r.file) });

// Rutas de página de Next
const pages = srcFiles.filter((f) => /src\/app\/.*\/page\.tsx$/.test(f) || /src\/app\/page\.tsx$/.test(f));
const isClient = (f) => {
	const head = fs.readFileSync(f, "utf8").slice(0, 200);
	return /^\s*["']use client["']/.test(head);
};
const pageInfo = pages.map((pg) => {
	const seen = new Set([pg]);
	const q = [pg];
	while (q.length) {
		const f = q.pop();
		for (const i of imports[f] || []) if (!seen.has(i) && i.startsWith(path.join(FRONT, "src"))) {
			seen.add(i);
			q.push(i);
		}
	}
	const reached = [...seen];
	const apis = Object.keys(apiUsage).filter((k) => reached.some((f) => apiUsage[k].has(f))).sort();
	const raws = rawFetch.filter((r) => reached.includes(r.abs)).map((r) => r.fn);
	const views = reached
		.filter((f) => /src\/(views|components)\//.test(f) && isClient(f))
		.map((f) => relF(f).replace(/^src\/(views|components)\//, ""));
	const rel = path.relative(path.join(FRONT, "src/app"), path.dirname(pg));
	const route = "/" + (rel || "").replace(/\[locale\]\/?/, "{locale}/").replace(/\/$/, "");
	const isRoot = path.relative(FRONT, pg) === "src/app/page.tsx";
	return {
		route: isRoot ? "/ (redirige a /{locale})" : route,
		file: relF(pg),
		render: views.length ? "servidor + vista cliente" : "servidor",
		views: [...new Set(views)].slice(0, 4),
		apis,
		raws,
	};
});

/* ───────────────────────── BACK ───────────────────────── */

const BR = path.join(BACK, "src/routes");
const routeFiles = walk(BR, /\.js$/);
// Mapa: archivo → [{prefix, file}] y rutas por archivo
const requireMap = (f) => {
	const src = fs.readFileSync(f, "utf8");
	const map = {};
	for (const m of src.matchAll(/const\s+(\w+)\s*=\s*require\(\s*["']([^"']+)["']\s*\)/g)) {
		const abs = path.resolve(path.dirname(f), m[2]);
		const cand = [abs + ".js", path.join(abs, "index.js"), abs].find(
			(c) => fs.existsSync(c) && fs.statSync(c).isFile(),
		);
		if (cand) map[m[1]] = cand;
	}
	return map;
};
const mounts = {}; // file -> [{prefix, child}]
for (const f of routeFiles) {
	const src = fs.readFileSync(f, "utf8");
	const map = requireMap(f);
	mounts[f] = [];
	for (const m of src.matchAll(/router\.use\(\s*"([^"]+)"\s*,\s*(\w+)\s*\)/g)) {
		if (map[m[2]]) mounts[f].push({ prefix: m[1], child: map[m[2]] });
	}
}
const routes = [];
const walkRoutes = (file, prefix, inheritedAuth) => {
	const src = fs.readFileSync(file, "utf8");
	const fileAuth = /router\.use\(\s*authenticate\s*\)/.test(src)
		? /authorize\(\s*"admin"\s*\)/.test(src)
			? "admin"
			: "usuario"
		: null;
	const base = inheritedAuth || fileAuth;
	const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
	const visit = (n) => {
		if (
			ts.isCallExpression(n) &&
			ts.isPropertyAccessExpression(n.expression) &&
			n.expression.expression.getText(sf) === "router" &&
			/^(get|post|put|patch|delete)$/.test(n.expression.name.getText(sf)) &&
			n.arguments[0] &&
			ts.isStringLiteralLike(n.arguments[0])
		) {
			const method = n.expression.name.getText(sf).toUpperCase();
			const p = n.arguments[0].text;
			const argsText = n.arguments.map((a) => a.getText(sf)).join(" ");
			const auth = /\bauthenticate\b/.test(argsText) ? (/authorize/.test(argsText) ? "admin" : "usuario") : base || "público";
			const ctrl = (argsText.match(/(\w+Controller)\.(\w+)/) || [])[0] || "";
			routes.push({ method, path: (prefix + (p === "/" ? "" : p)).replace(/\/$/, "") || "/", auth, file: path.relative(BACK, file), handler: ctrl });
		}
		ts.forEachChild(n, visit);
	};
	visit(sf);
	for (const m of mounts[file] || []) walkRoutes(m.child, prefix + (m.prefix === "/" ? "" : m.prefix), base);
};
const entry = path.join(BR, "index.js");
// routes/index.js monta /v1; el resto de prefijos vienen de cada router
const v1 = path.join(BR, "v1/index.js");
for (const m of mounts[entry] || []) if (m.child === v1) walkRoutes(v1, "/api" + m.prefix);
// Rutas de app.js fuera de /api
routes.push({ method: "GET", path: "/health", auth: "público", file: "src/app.js", handler: "inline" });
// Para evitar duplicados si una ruta aparece en un router montado dos veces
const uniq = [...new Map(routes.map((r) => [r.method + " " + r.path, r])).values()].sort((a, b) =>
	a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path),
);

// Modelos Prisma
const schema = fs.readFileSync(path.join(BACK, "prisma/schema.prisma"), "utf8");
const models = [...schema.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g)].map((m) => {
	const body = m[2].split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("@@") && !l.startsWith("//"));
	const scalars = body.filter((l) => /^\w+\s+[\w\[\]?]+/.test(l) && !/\]\s*$/.test(l.split(/\s+/)[1] || "") && !/@relation/.test(l));
	const relations = body.filter((l) => /@relation|\b[A-Z]\w*\[\]|\b[A-Z]\w*\?\s/.test(l) && !/@db|@map|@id|@default/.test(l));
	const table = (m[2].match(/@@map\("([^"]+)"\)/) || [])[1] || m[1];
	return { name: m[1], table, fields: body.length, scalarCount: scalars.length, relationCount: relations.length };
});
const enums = [...schema.matchAll(/enum\s+(\w+)\s*\{([\s\S]*?)\}/g)].map((m) => ({
	name: m[1],
	values: m[2].split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l) => l.split(/\s+/)[0]),
}));

/* ───────────────────────── CRUCE ───────────────────────── */

const norm = (p) =>
	(p || "")
		.replace(/\?.*$/, "")
		.replace(/:[a-zA-Z_]+/g, ":p")
		.replace(/\/+$/, "");
const beSet = new Set(uniq.map((r) => r.method + " " + norm(r.path)));
const feRows = [];
for (const [name, e] of Object.entries(endpoints)) {
	const usedBy = [...(apiUsage[name] || [])].map((f) => relF(f));
	const pagesUsing = pageInfo.filter((p) => p.apis.includes(name)).map((p) => p.route);
	const exists = e.path && beSet.has(e.method + " " + norm(e.path));
	feRows.push({ name, method: e.method, path: e.path || "(dinámica)", auth: e.auth, exists, usedBy, pagesUsing });
}
for (const r of RAW) {
	const exists = beSet.has(r.method + " " + norm(r.path));
	feRows.push({ name: r.fn, method: r.method, path: r.path, auth: "público", exists, usedBy: [r.file], pagesUsing: pageInfo.filter((p) => p.raws.includes(r.fn)).map((p) => p.route) });
}
const feKeys = new Set(feRows.map((r) => r.method + " " + norm(r.path)));
const beUnused = uniq.filter((r) => !feKeys.has(r.method + " " + norm(r.path)) && r.path !== "/health" && r.handler !== "");

/* ───────────────────────── ESCRITURA ───────────────────────── */

const fm = (title, desc) => `---\ntitle: ${title}\ndescription: ${desc}\n---\n\n`;
const gen = "> Página generada por `scripts/generate-reference.cjs`. No editar a mano.\n\n";
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

// 1) APIs del front
{
	const exists = feRows.filter((r) => r.exists).length;
	let md = fm("APIs que usa el front", "Cada llamada del front al backend, con su estado en el backend local.");
	md += gen;
	md += `Total: **${feRows.length}** llamadas. Existen en el backend local: **${exists}**. No existen: **${feRows.length - exists}**.\n\n`;
	md += "| Función del front | HTTP | Ruta | Auth | En backend local | Pantallas (ruta) | Archivo |\n|---|---|---|---|---|---|---|\n";
	for (const r of feRows.sort((a, b) => (a.exists === b.exists ? a.name.localeCompare(b.name) : a.exists ? 1 : -1))) {
		md += `| \`${cell(r.name)}\` | ${r.method} | \`${cell(r.path)}\` | ${cell(r.auth)} | ${r.exists ? "✅ sí" : "❌ no"} | ${cell(r.pagesUsing.join(", ") || "—")} | ${cell(r.usedBy.slice(0, 2).join("<br>") || "—")} |\n`;
	}
	fs.writeFileSync(path.join(OUT, "front-apis.md"), md);
}

// 2) Rutas del front
{
	let md = fm("Rutas y pantallas del front", "Cada ruta de Next, cómo se renderiza y qué API consume.");
	md += gen;
	md += "| Ruta | Archivo de la ruta | Render | Componentes cliente (hasta 4) | APIs |\n|---|---|---|---|---|\n";
	for (const p of pageInfo.sort((a, b) => a.route.localeCompare(b.route))) {
		const apis = [...p.apis, ...p.raws].join(", ") || "—";
		md += `| \`${cell(p.route)}\` | \`${cell(p.file)}\` | ${p.render} | ${cell(p.views.join(", ") || "—")} | ${cell(apis)} |\n`;
	}
	fs.writeFileSync(path.join(OUT, "front-rutas.md"), md);
}

// 3) Rutas del backend
{
	let md = fm("Rutas del backend", "Endpoints Express del backend local, con su auth y el archivo que los define.");
	md += gen;
	md += `Total: **${uniq.length}** rutas. Las que el front no llama: **${beUnused.length}**.\n\n`;
	md += "| Método | Ruta | Auth | Handler | Archivo | ¿Lo usa el front? |\n|---|---|---|---|---|---|\n";
	for (const r of uniq) {
		const used = feKeys.has(r.method + " " + norm(r.path));
		md += `| ${r.method} | \`${cell(r.path)}\` | ${cell(r.auth)} | \`${cell(r.handler)}\` | \`${cell(r.file)}\` | ${used ? "sí" : "no"} |\n`;
	}
	fs.writeFileSync(path.join(OUT, "backend-rutas.md"), md);
}

// 4) Modelo de datos
{
	let md = fm("Modelo de datos (Prisma)", "Tablas del backend, cuántos campos tienen y los enums.");
	md += gen;
	md += `Modelos: **${models.length}**. Enums: **${enums.length}**.\n\n`;
	md += "| Modelo Prisma | Tabla | Campos | Relaciones (aprox.) |\n|---|---|---|---|\n";
	for (const m of models) md += `| ${m.name} | \`${m.table}\` | ${m.fields} | ${m.relationCount} |\n`;
	md += "\n## Enums\n\n";
	for (const e of enums) md += `- **${e.name}**: ${e.values.map((v) => "`" + v + "`").join(", ")}\n`;
	fs.writeFileSync(path.join(OUT, "backend-modelo.md"), md);
}

// 5) Discrepancias
{
	const missing = feRows.filter((r) => !r.exists);
	let md = fm("Discrepancias front ↔ backend", "Llamadas del front que el backend local no expone y rutas del backend que nadie llama.");
	md += gen;
	md += `El front hace **${feRows.length}** llamadas; **${missing.length}** no tienen ruta en el backend local (\`${path.basename(BACK)}\`).\n\n`;
	const groups = {};
	for (const r of missing) {
		const k = (r.path.match(/\/api\/v1\/(admin\/)?([a-z-]+)/) || [])[2] || "otros";
		(groups[k] ??= []).push(r);
	}
	for (const [k, rs] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
		md += `## Dominio \`${k}\` (${rs.length})\n\n| Función | HTTP | Ruta |\n|---|---|---|\n`;
		for (const r of rs) md += `| \`${cell(r.name)}\` | ${r.method} | \`${cell(r.path)}\` |\n`;
		md += "\n";
	}
	md += "## Rutas del backend sin consumidor en el front\n\n| HTTP | Ruta |\n|---|---|\n";
	for (const r of beUnused) md += `| ${r.method} | \`${cell(r.path)}\` |\n`;
	fs.writeFileSync(path.join(OUT, "discrepancias.md"), md);
}

console.log(
	JSON.stringify(
		{
			frontCalls: feRows.length,
			frontMissingInBackend: feRows.filter((r) => !r.exists).length,
			backendRoutes: uniq.length,
			backendUnusedByFront: beUnused.length,
			pages: pageInfo.length,
			models: models.length,
			enums: enums.length,
		},
		null,
		2,
	),
);
