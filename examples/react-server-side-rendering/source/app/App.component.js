import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from "react";
import { IncidentsDashboard } from "../pages/IncidentsDashboard";
import { Meta } from "./components";
export const AppComponent = () => (_jsxs("html", { children: [_jsx("head", {}), _jsxs("body", { children: [_jsx(Meta, {}), _jsx(Suspense, { fallback: "Loading...", children: _jsx(IncidentsDashboard, {}) })] })] }));
