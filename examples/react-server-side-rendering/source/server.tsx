import { AppComponent } from "./app";
import { createCoreModel, withCore } from "./core";
import { withMovie } from "./modules/Movie";
import { CometaProvider } from "@cometa/react";
import { createScope } from "@cometa/react/scope";
import { Duplex } from "@cometa/react/server";
import express from "express";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { renderToPipeableStream } from "react-dom/server";

const require = createRequire(import.meta.url);

const client = resolve("build", "client");
const stats = require(join(client, "stats.json"));

const app = express();

app.get("/", (request, response) => {
	const { query } = request;

	const scope = createScope();

	const duplex = new Duplex(scope);

	const core = createCoreModel();
	core.sault.set((query.sault as string) ?? "");

	const Root = withCore(core)(withMovie(AppComponent));

	const stream = renderToPipeableStream(
		<CometaProvider scope={scope}>
			<Root />
		</CometaProvider>,
		{
			bootstrapScripts: stats.assetsByChunkName.main,
			onShellReady() {
				response.header("content-type", "text/html").status(200);
				stream.pipe(duplex).pipe(response);
			},
		},
	);
});

app.use(express.static(client));

app.listen(3000, () => {
	console.info(`Server is listening on :3000`);
});
