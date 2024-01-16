import { effect, model, store } from "@cometa/core";
import { link } from "@cometa/core/link";
export const createIncidentsDashboardPage = model(async ({ incidents }) => {
    const list = store([]);
    const listIncidentsFx = effect(incidents.listIncidentsFx);
    link({
        clock: { subject: listIncidentsFx.resulted },
        target: list,
    });
    console.log("before");
    await listIncidentsFx();
    console.log("after");
    return {
        list,
    };
});
