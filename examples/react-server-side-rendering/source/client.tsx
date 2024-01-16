import { hydrateRoot } from "react-dom/client";

import { CometaProvider } from "@cometa/react";
import { createScope } from "@cometa/react/scope";

import { App } from "./app";
import { CoreProvider, createCoreModel } from "./core";

window.scope = createScope().hydrate(window.state);

hydrateRoot(
	document,
	<CometaProvider scope={window.scope}>
		<CoreProvider value={createCoreModel()}>
			<App />
		</CoreProvider>
	</CometaProvider>,
);
