import { join, resolve } from "node:path";

export default {
	preset: "ts-jest",
	testMatch: [join(resolve(), "/**/*.spec.ts(x)?")],
	coverageDirectory: join(resolve(), "coverage"),
};
