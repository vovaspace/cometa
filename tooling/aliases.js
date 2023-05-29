import { stringify } from "./stringify.js";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);

const root = resolve();
const pkgpath = join(root, "package.json");
const pkg = require(pkgpath);

const aliases = [];

if (pkg.exports) {
	for (const entrypoint of Object.keys(pkg.exports)) {
		if (entrypoint === ".") continue;

		const name = entrypoint.substring(2);

		aliases.push(name);

		const alias = {
			name: `${pkg.name}/${name}`,
			main: `../lib/cjs/${name}.cjs`,
			module: `../lib/esm/${name}.js`,
			types: `../lib/declaration/${name}.d.ts`,
			sideEffects: false,
		};

		const dist = join(root, entrypoint);
		await mkdir(dist);
		await writeFile(join(dist, "package.json"), stringify(alias));
	}
}

pkg.files = ["lib", ...aliases];
await writeFile(pkgpath, stringify(pkg));
