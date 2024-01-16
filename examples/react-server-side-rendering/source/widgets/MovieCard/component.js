import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useSource } from "@cometa/react";
import { useMovieCardModel } from "./model";
export const MovieComponent = () => {
    const model = useMovieCardModel();
    const name = useSource(model.name);
    return (_jsx("article", { children: _jsxs("h2", { children: ["Movie ", name] }) }));
};
