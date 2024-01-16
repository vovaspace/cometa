import { model, store } from "@cometa/core";
import { createScope } from "./scope.server";
describe("scope", () => {
    describe("server", () => {
        it("dehydrates bound model instances", () => {
            const createInternal = model(() => ({
                store: store("internal"),
            }));
            const createPublic = model(() => ({
                internal: createInternal(),
                store: store("public"),
            }));
            const createExtra = model(() => ({
                store: store("extra"),
            }));
            const publicInstance = createPublic();
            const extraInstance = createExtra();
            const scope = createScope();
            scope.bind("public", publicInstance);
            scope.bind("extra", extraInstance);
            expect(scope.dehydrate()).toStrictEqual([
                {
                    public: ["public", "internal"],
                    extra: ["extra"],
                },
                {},
            ]);
        });
    });
});
