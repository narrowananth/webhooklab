import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..", "..");
const sourceDir = join(
	packageRoot,
	"node_modules",
	"@fontsource",
	"material-symbols-outlined",
	"files",
);
const destDir = join(packageRoot, "public", "asset", "icon");

const FILES = [
	"material-symbols-outlined-latin-300-normal.woff2",
	"material-symbols-outlined-latin-300-normal.woff",
	"material-symbols-outlined-latin-400-normal.woff2",
	"material-symbols-outlined-latin-400-normal.woff",
];

if (!existsSync(sourceDir)) {
	process.exit(0);
}

if (!existsSync(destDir)) {
	mkdirSync(destDir, { recursive: true });
}

for (const name of FILES) {
	const src = join(sourceDir, name);
	const dest = join(destDir, name);
	if (existsSync(src)) {
		copyFileSync(src, dest);
	}
}
