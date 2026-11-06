#!/usr/bin/env node
/**
 * Copia los documentos de auditoría y de refactorización al sitio, con frontmatter de Starlight.
 *
 *   DOCS_SRC=/ruta/a/los/documentos node scripts/sync-docs.cjs
 *
 * Por defecto busca en ~/Downloads.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const SRC = process.env.DOCS_SRC || path.join(os.homedir(), "Downloads");
const OUT = path.join(__dirname, "..", "src", "content", "docs");

const COPIES = [
	{
		file: "Gomi — Auditoría front complementaria.md",
		dest: "auditoria/complementaria.md",
		title: "Auditoría front complementaria",
		description: "Hallazgos del frontend que no estaban en la auditoría original.",
	},
	{
		file: "Gomi — Plan de refactorización front.md",
		dest: "refactor/plan.md",
		title: "Plan de refactorización del frontend",
		description: "Carpetas por dominio, código muerto, duplicados, SOLID y fases.",
	},
];

for (const c of COPIES) {
	const src = path.join(SRC, c.file);
	if (!fs.existsSync(src)) {
		console.error(`No encontrado: ${src}`);
		process.exitCode = 1;
		continue;
	}
	// Quita el H1 del original: Starlight muestra el título del frontmatter
	const body = fs
		.readFileSync(src, "utf8")
		.replace(/^#\s[^\n]*\n+/, "")
		.replace(/\/home\/[^/\s`]+\/Documents\//g, "~/Documents/");
	const out = `---\ntitle: ${c.title}\ndescription: ${c.description}\n---\n\n> Copia sincronizada desde \`${c.file}\`. Editar el original y volver a ejecutar \`pnpm sync\`.\n\n${body}`;
	fs.writeFileSync(path.join(OUT, c.dest), out);
	console.log(`✔ ${c.dest}`);
}
