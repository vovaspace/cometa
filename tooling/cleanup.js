import { stringify } from "./stringify.js";
import { readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);

const { workdirs } = require("../package.json");

const root = resolve();

const current = (await readdir(root, { withFileTypes: true })).filter(
	(dirent) => dirent.isDirectory() && !workdirs.includes(dirent.name),
);

for (const dir of current) {
	await rm(join(root, dir.name), { recursive: true });
}

const pkgpath = join(root, "package.json");
const pkg = require(pkgpath);
delete pkg.files;
await writeFile(pkgpath, stringify(pkg));
