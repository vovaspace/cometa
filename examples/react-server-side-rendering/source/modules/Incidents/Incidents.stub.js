import { generate } from "random-words";
import { IncidentSeverity } from "./entities";
let currentId = 0;
const id = () => `inc_${currentId++}`;
export const incidents = [
    {
        id: id(),
        createdAt: new Date(),
        resolvedAt: null,
        severity: IncidentSeverity.Critical,
        title: generate({ min: 4, max: 12, join: " " }),
    },
];
