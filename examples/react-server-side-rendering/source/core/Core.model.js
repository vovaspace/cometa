import { event, model, store } from "@cometa/core";
import { link } from "@cometa/core/link";
export const createCoreModel = model(() => {
    const counter = store(0);
    const sault = store("");
    const increased = event();
    link({
        clock: { subject: increased },
        source: { subject: counter },
        map: (_, source) => source + 1,
        target: counter,
    });
    return {
        counter,
        sault,
        increased,
    };
});
