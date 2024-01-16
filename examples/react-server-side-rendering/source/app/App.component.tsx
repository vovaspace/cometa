import { Suspense } from "react";

import { IncidentsDashboard } from "../pages/IncidentsDashboard";
import { Meta } from "./components";

export const AppComponent = () => (
	<html>
		<head />
		<body>
			<Meta />
			<Suspense fallback="Loading...">
				<IncidentsDashboard />
			</Suspense>
		</body>
	</html>
);
