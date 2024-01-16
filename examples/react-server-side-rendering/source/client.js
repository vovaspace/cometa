import { jsx as _jsx } from "react/jsx-runtime";
import { hydrateRoot } from "react-dom/client";
import { CometaProvider } from "@cometa/react";
import { createScope } from "@cometa/react/scope";
import { App } from "./app";
import { CoreProvider, createCoreModel } from "./core";
window.scope = createScope().hydrate(window.state);
hydrateRoot(document, _jsx(CometaProvider, { scope: window.scope, children: _jsx(CoreProvider, { value: createCoreModel(), children: _jsx(App, {}) }) }));
