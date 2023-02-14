import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);

const root = resolve();
const lib = join(root, "lib");

const pkg = require(join(root, "package.json"));

const writeJSON = (path, content) =>
	writeFile(path, JSON.stringify(content, null, "	"));

const fields = (...names) =>
	names.reduce((acc, name) => {
		const source = pkg[name];
		if (source) acc[name] = source;
		return acc;
	}, {});

const manifest = {
	name: `@cometa/${pkg.name}`,
	...fields("version", "description"),
	main: `./internal/cjs/index.js`,
	module: `./internal/esm/index.js`,
	types: `./internal/declaration/index.d.ts`,
	exports: {
		".": {
			require: "./internal/cjs/index.js",
			module: "./internal/esm/index.js",
			types: "./internal/declaration/index.d.ts",
			default: "./internal/cjs/index.js",
		},
	},
	sideEffects: false,
	...fields(
		"license",
		"author",
		"homepage",
		"repository",
		"bugs",
		"dependencies",
		"peerDependencies",
		"keywords",
	),
};

if (pkg.entrypoints) {
	for (const entrypoint of pkg.entrypoints) {
		manifest.exports[`./${entrypoint}`] = {
			require: `./internal/cjs/${entrypoint}/index.js`,
			module: `./internal/esm/${entrypoint}/index.js`,
			types: `./internal/declaration/${entrypoint}/index.d.ts`,
			default: `./internal/cjs/${entrypoint}/index.js`,
		};

		const alias = {
			name: `@cometa/${pkg.name}/${entrypoint}`,
			main: `../internal/cjs/${entrypoint}/index.js`,
			module: `../internal/esm/${entrypoint}/index.js`,
			types: `../internal/declaration/${entrypoint}/index.d.ts`,
			sideEffects: false,
		};

		const dist = join(lib, entrypoint);

		await mkdir(dist);
		await writeJSON(join(dist, "package.json"), alias);
	}
}

await writeJSON(join(lib, "package.json"), manifest);
