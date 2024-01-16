import { jsx as _jsx } from "react/jsx-runtime";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import express from "express";
import { renderToPipeableStream } from "react-dom/server";
import { CometaProvider } from "@cometa/react";
import { createScope } from "@cometa/react/scope";
import { Duplex } from "@cometa/react/server";
import { App } from "./app";
import { CoreProvider, createCoreModel } from "./core";
const require = createRequire(import.meta.url);
const client = resolve("build", "client");
const stats = require(join(client, "stats.json"));
const app = express();
app.get("/", (request, response) => {
    const { query } = request;
    const scope = createScope();
    const duplex = new Duplex(scope);
    const core = createCoreModel();
    core.sault.set(query.sault ?? "");
    const stream = renderToPipeableStream(_jsx(CometaProvider, { scope: scope, children: _jsx(CoreProvider, { value: core, children: _jsx(App, {}) }) }), {
        bootstrapScripts: stats.assetsByChunkName.main,
        onShellReady() {
            response.header("content-type", "text/html").status(200);
            stream.pipe(duplex).pipe(response);
        },
    });
});
app.use(express.static(client));
app.listen(3000, () => {
    console.info(`Server is listening on :3000`);
});
