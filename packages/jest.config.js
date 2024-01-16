import { resolve } from "node:path";

export default {
	rootDir: resolve(),
	preset: "ts-jest",
	testMatch: ["<rootDir>/source/*.spec.ts(x)?"],
	coverageDirectory: "<rootDir>/coverage",
	collectCoverageFrom: ["<rootDir>/lib/*.js"],
};
