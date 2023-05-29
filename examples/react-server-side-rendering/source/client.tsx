import { AppComponent } from "./app";
import { createCoreModel, withCore } from "./core";
import { withMovie } from "./modules/Movie";
import { CometaProvider } from "@cometa/react";
import { createScope } from "@cometa/react/scope";
import { hydrateRoot } from "react-dom/client";

window.scope = createScope().hydrate(window.state);

const core = createCoreModel();

const Root = withCore(core)(withMovie(AppComponent));

hydrateRoot(
	document,
	<CometaProvider scope={window.scope}>
		<Root />
	</CometaProvider>,
);
