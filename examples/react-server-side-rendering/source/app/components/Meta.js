import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// import { MovieToken } from "../../modules/Movie";
import { useSource, useToken } from "@cometa/react";
import { CoreToken } from "../../core";
export const Meta = () => {
    const core = useToken(CoreToken);
    // const movie = useToken(MovieToken);
    const sault = useSource(core.sault);
    const counter = useSource(core.counter);
    // const isLoading = useSource(movie.isLoading);
    return (_jsxs("div", { children: [_jsxs("span", { children: ["Sault: ", sault] }), _jsxs("div", { children: [_jsxs("span", { children: ["Counter: ", counter] }), _jsx("button", { type: "button", onClick: () => core.increased(), children: "Plus" })] })] }));
};
