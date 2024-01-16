import { generate } from "random-words";

import { Incident, IncidentSeverity } from "./entities";

let currentId = 0;
const id = () => `inc_${currentId++}`;

export const incidents: Incident[] = [
	{
		id: id(),
		createdAt: new Date(),
		resolvedAt: null,
		severity: IncidentSeverity.Critical,
		title: generate({ min: 4, max: 12, join: " " }),
	},
];
