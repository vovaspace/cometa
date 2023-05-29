import { resolve } from "node:path";
import prettier from "prettier";

const config = await prettier.resolveConfig(resolve());

export const stringify = (input) =>
	prettier.format(JSON.stringify(input, null, "	"), {
		...config,
		parser: "json-stringify",
	});
