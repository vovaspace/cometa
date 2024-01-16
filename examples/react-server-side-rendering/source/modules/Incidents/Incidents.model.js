import { effect, model } from "@cometa/core";
import { incidents } from "./Incidents.stub";
export const createIncidentsModule = model(() => {
    const listIncidentsFx = effect(() => new Promise((resolve) => {
        console.log("requested");
        setTimeout(() => {
            resolve(incidents);
        }, 2000);
    }));
    console.log("`Incidents` module created.");
    return {
        listIncidentsFx,
    };
});
