import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSource } from "@cometa/react";
import { useIncidentsDashboardPage } from "./IncidentsDashboard.provider";
export const IncidentsDashboardComponent = ({ className, }) => {
    const model = useIncidentsDashboardPage();
    const incidents = useSource(model.list);
    return (_jsxs("main", { className: className, children: ["Hi", _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Severity" }), _jsx("th", { children: "Title" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Resolved" })] }) }), _jsx("tbody", { children: incidents.map((incident) => (_jsxs("tr", { children: [_jsx("td", { children: incident.severity }), _jsx("td", { children: incident.title }), _jsx("td", { children: incident.createdAt.toLocaleDateString() }), _jsx("td", { children: incident.resolvedAt?.toLocaleDateString() })] }, incident.id))) })] })] }));
};
