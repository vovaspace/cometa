import { opendir, readFile, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const replace = async (type, file) => {
	const content = (await readFile(file)).toString();
	const replaced =
		type === "cjs"
			? content.replace(
					/^(const|let|var) (.+) = require\("(.+)"\);$/gm,
					(found, action, name, from) =>
						from.startsWith(".")
							? `${action} ${name} = require("${from}.cjs");`
							: found,
			  )
			: content.replace(
					/^(import|export) (.+?) from "(.+)";$/gm,
					(found, action, declaration, from) =>
						from.startsWith(".")
							? `${action} ${declaration} from "${from}.js";`
							: found,
			  );

	await writeFile(file, replaced);

	if (type === "cjs") await rename(file, file.replace(".js", ".cjs"));
};

const walk = async (type, dir) => {
	for await (const dirent of await opendir(dir)) {
		const entry = join(dir, dirent.name);

		if (dirent.isDirectory()) await walk(type, entry);
		else if (dirent.isFile()) replace(type, entry);
	}
};

const lib = resolve("lib");
await Promise.all([
	walk("cjs", join(lib, "cjs")),
	walk("esm", join(lib, "esm")),
]);
