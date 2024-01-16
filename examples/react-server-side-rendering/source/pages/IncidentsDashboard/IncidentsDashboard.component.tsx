import { FC } from "react";

import { useSource } from "@cometa/react";

import { useIncidentsDashboardPage } from "./IncidentsDashboard.provider";

export const IncidentsDashboardComponent: FC<{ className?: string }> = ({
	className,
}) => {
	const model = useIncidentsDashboardPage();

	const incidents = useSource(model.list);

	return (
		<main className={className}>
			Hi
			<table>
				<thead>
					<tr>
						<th>Severity</th>
						<th>Title</th>
						<th>Created</th>
						<th>Resolved</th>
					</tr>
				</thead>
				<tbody>
					{incidents.map((incident) => (
						<tr key={incident.id}>
							<td>{incident.severity}</td>
							<td>{incident.title}</td>
							<td>{incident.createdAt.toLocaleDateString()}</td>
							<td>{incident.resolvedAt?.toLocaleDateString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
};
