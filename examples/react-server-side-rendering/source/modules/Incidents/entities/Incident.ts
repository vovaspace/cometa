export enum IncidentSeverity {
	Minor = "minor",
	Medium = "medium",
	Critical = "critical",
}

export type Incident = {
	id: string;
	createdAt: Date;
	resolvedAt: Date | null;
	severity: IncidentSeverity;
	title: string;
};
