import { createDispatcher } from "../dispatcher";
import { createEffect } from "../effect";
import { createEvent } from "../event";
import { createStore } from "../store";
import { createStream } from "../stream";
import { bind, link, unlink } from "./scheduler";

describe("scheduler", () => {
	describe("linking", () => {
		describe("notifying", () => {
			it("links clock to target without payload", () => {
				const trigger = createEvent<number>();
				const target = jest.fn<void, []>();

				link({ clock: { subject: trigger }, target });

				trigger(0);

				expect(target).toHaveBeenCalledTimes(1);
			});
		});

		describe("forwarding", () => {
			it("links clock to target with payload", () => {
				const trigger = createEvent<number>();
				const target = jest.fn<void, [number]>();

				link({ clock: { subject: trigger }, target });

				trigger(0);

				expect(target).toHaveBeenCalledWith(0);
			});

			it("links guarded clock to target", () => {
				const trigger = createEvent<number | string>();
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					target,
				});

				trigger("0");

				expect(target).not.toHaveBeenCalled();

				trigger(0);

				expect(target).toHaveBeenCalledWith(0);
			});

			it("links clock to target with filtering", () => {
				const trigger = createEvent<number>();
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					filter: (payload) => payload % 2 === 0,
					target,
				});

				trigger(1);

				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});

			it("links guarded clock to target with filtering", () => {
				const trigger = createEvent<string | number>();
				const filter = jest.fn((payload: number) => payload % 2 === 0);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					filter,
					target,
				});

				trigger("2");

				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(1);

				expect(filter).toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});

			it("links clock to target with sourcing and filtering", () => {
				const trigger = createEvent<number>();
				const active = createStore<boolean>(false);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: active,
					},
					filter: (payload, source) => source && payload % 2 === 0,
					target,
				});

				trigger(2);

				expect(target).not.toHaveBeenCalled();

				active.set(true);
				trigger(1);

				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});

			it("links clock to target with guarded sourcing and filtering", () => {
				const trigger = createEvent<number>();
				const active = createStore<boolean | null>(null);
				const filter = jest.fn(
					(payload: number, source: boolean) => source && payload % 2 === 0,
				);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: active,
						guard: (source): source is boolean => typeof source === "boolean",
					},
					filter,
					target,
				});

				trigger(2);

				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(false);
				trigger(2);

				expect(filter).toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(true);
				trigger(1);

				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});

			it("links guarded clock to target with sourcing and filtering", () => {
				const trigger = createEvent<string | number>();
				const active = createStore<boolean>(false);
				const reader = jest.spyOn(active, "read");
				const filter = jest.fn(
					(payload: number, source: boolean) => source && payload % 2 === 0,
				);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: active,
					},
					filter,
					target,
				});

				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(filter).toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(true);

				trigger(1);

				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});

			it("links guarded clock to target with guarded sourcing and filtering", () => {
				const trigger = createEvent<string | number>();
				const active = createStore<boolean | null>(null);
				const reader = jest.spyOn(active, "read");
				const sguard = jest.fn(
					(source: boolean | null): source is boolean => typeof source === "boolean",
				);
				const filter = jest.fn(
					(payload: number, source: boolean) => source && payload % 2 === 0,
				);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: active,
						// @ts-expect-error: Signature '(source: boolean | null): boolean' must be a type predicate.
						guard: sguard,
					},
					filter,
					target,
				});

				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(sguard).toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				reader.mockClear();
				sguard.mockClear();
				active.set(false);
				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(true);
				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(false);
				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(sguard).toHaveBeenCalled();
				expect(filter).toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				active.set(true);
				trigger(2);

				expect(target).toHaveBeenCalledWith(2);
			});
		});

		describe("mapping", () => {
			it("links clock to target with mapping", () => {
				const trigger = createEvent<string>();
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					map: (payload) => Number.parseInt(payload, 10),
					target,
				});

				trigger("0");

				expect(target).toHaveBeenCalledWith(0);
			});

			it("links guarded clock to target with mapping", () => {
				const trigger = createEvent<string | number>();
				const map = jest.fn((payload: number) => payload * 10);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					map,
					target,
				});

				trigger("0");

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(1);

				expect(target).toHaveBeenCalledWith(10);
			});

			it("links clock to target with filtering and mapping", () => {
				const trigger = createEvent<string>();
				const map = jest.fn((payload: string) => Number.parseInt(payload, 10));
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					filter: (payload) => payload.length === 2,
					map,
					target,
				});

				trigger("2");

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger("20");

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links guarded clock to target with filtering and mapping", () => {
				const trigger = createEvent<string | number>();
				const filter = jest.fn((payload: number) => payload % 2 === 0);
				const map = jest.fn((payload: number) => payload * 10);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					filter,
					map,
					target,
				});

				trigger("0");

				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(1);

				expect(filter).toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links clock to target with sourcing and mapping", () => {
				const trigger = createEvent<number>();
				const multiplier = createStore<number>(10);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: multiplier,
					},
					map: (payload, source) => payload * source,
					target,
				});

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links clock to target with guarded sourcing and mapping", () => {
				const trigger = createEvent<number>();
				const multiplier = createStore<number | null>(null);
				const map = jest.fn((payload: number, source: number) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: multiplier,
						guard: (source): source is number => typeof source === "number",
					},
					map,
					target,
				});

				trigger(2);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(10);
				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links guarded clock to target with sourcing and mapping", () => {
				const trigger = createEvent<string | number>();
				const multiplier = createStore<number>(10);
				const reader = jest.spyOn(multiplier, "read");
				const map = jest.fn((payload: number, source: number) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: multiplier,
					},
					map,
					target,
				});

				trigger("0");

				expect(reader).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links guarded clock to target with guarded sourcing and mapping", () => {
				const trigger = createEvent<string | number>();
				const multiplier = createStore<number | null>(null);
				const reader = jest.spyOn(multiplier, "read");
				const sguard = jest.fn(
					(source: number | null): source is number => typeof source === "number",
				);
				const map = jest.fn((payload: number, source: number) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: multiplier,
						// @ts-expect-error: Signature '(source: number | null): boolean' must be a type predicate.
						guard: sguard,
					},
					map,
					target,
				});

				trigger("0");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(0);

				expect(reader).toHaveBeenCalled();
				expect(sguard).toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				reader.mockClear();
				sguard.mockClear();
				multiplier.set(10);
				trigger("0");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links clock to target with sourcing, filtering and mapping", () => {
				const trigger = createEvent<number>();
				const multiplier = createStore<number>(5);
				const map = jest.fn((payload: number, source: number) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: multiplier,
					},
					filter: (payload, source) => payload % 2 === 0 && source % 10 === 0,
					map,
					target,
				});

				trigger(2);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(10);
				trigger(1);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links clock to target with guarded sourcing, filtering and mapping", () => {
				const trigger = createEvent<number>();
				const multiplier = createStore<number | null>(null);
				const filter = jest.fn(
					(payload: number, source: number) =>
						payload % 2 === 0 && source % 10 === 0,
				);
				const map = jest.fn((payload, source) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
					},
					source: {
						subject: multiplier,
						guard: (source): source is number => typeof source === "number",
					},
					filter,
					map,
					target,
				});

				trigger(2);

				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(5);
				trigger(2);

				expect(filter).toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(10);
				trigger(1);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links guarded clock to target with sourcing, filtering and mapping", () => {
				const trigger = createEvent<string | number>();
				const multiplier = createStore<number>(5);
				const reader = jest.spyOn(multiplier, "read");
				const filter = jest.fn(
					(payload: number, source: number) =>
						payload % 2 === 0 && source % 10 === 0,
				);
				const map = jest.fn((payload, source) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: multiplier,
					},
					filter,
					map,
					target,
				});

				trigger("0");

				expect(reader).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(filter).toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(10);
				trigger(1);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});

			it("links guarded clock to target with guarded sourcing, filtering and mapping", () => {
				const trigger = createEvent<string | number>();
				const multiplier = createStore<number | null>(null);
				const reader = jest.spyOn(multiplier, "read");
				const sguard = jest.fn(
					(source: number | null): source is number => typeof source === "number",
				);
				const filter = jest.fn(
					(payload: number, source: number) =>
						payload % 2 === 0 && source % 10 === 0,
				);
				const map = jest.fn((payload, source) => payload * source);
				const target = jest.fn<void, [number]>();

				link({
					clock: {
						subject: trigger,
						guard: (payload): payload is number => typeof payload === "number",
					},
					source: {
						subject: multiplier,
						// @ts-expect-error: Signature '(source: number | null): boolean' must be a type predicate.
						guard: sguard,
					},
					filter,
					map,
					target,
				});

				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(sguard).toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				reader.mockClear();
				sguard.mockClear();
				multiplier.set(5);
				trigger("2");

				expect(reader).not.toHaveBeenCalled();
				expect(sguard).not.toHaveBeenCalled();
				expect(filter).not.toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(reader).toHaveBeenCalled();
				expect(sguard).toHaveBeenCalled();
				expect(filter).toHaveBeenCalled();
				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				multiplier.set(10);
				trigger(1);

				expect(map).not.toHaveBeenCalled();
				expect(target).not.toHaveBeenCalled();

				trigger(2);

				expect(target).toHaveBeenCalledWith(20);
			});
		});
	});

	describe("ordering", () => {
		it("performs sourced links with actual state", () => {
			const initial = 1;
			const base = createStore(initial);
			const multiplier = createStream<number>((ctrl) => 10 * ctrl.read(base));
			const derived = createStream<number>(
				(ctrl) => ctrl.read(base) * ctrl.read(multiplier),
			);
			const trigger = createEvent();
			const target = jest.fn();

			link({
				clock: {
					subject: trigger,
				},
				source: {
					subject: derived,
				},
				map: (_, source) => source,
				target,
			});

			link({
				clock: {
					subject: trigger,
				},
				map: () => initial + 1,
				target: base,
			});

			trigger();

			expect(target).toHaveBeenCalledWith(40);
		});

		it("runs the dispatchers enqueued during sourced links performing", () => {
			const base = createStore(1);
			const multiplier = createStore(10);

			const listener = jest.fn();
			const derived = createStream<number>(
				(ctrl) => ctrl.read(base) * ctrl.read(multiplier),
			);
			derived.listen(listener);

			const trigger = createEvent();

			link({
				clock: {
					subject: trigger,
				},
				source: {
					subject: base,
				},
				map: (_, source) => source + 1,
				target: base,
			});

			link({
				clock: {
					subject: base,
				},
				map: (payload) => payload * 10,
				target: multiplier,
			});

			trigger();

			expect(listener).toHaveBeenCalledWith(40);
		});
	});

	describe("handling", () => {
		it("handles exception inside effect", () => {
			const handler = jest.fn();
			const effect = createEffect(handler);
			const trigger = createEvent();

			link({
				clock: {
					subject: trigger,
				},
				target: effect,
			});

			const error = new Error();
			handler.mockRejectedValue(error);

			expect(trigger).not.toThrowError();
		});
	});

	describe("binding", () => {
		it("runs the dispatcher when the subject receives the first link", () => {
			const setup = jest.fn();
			const dispatcher = createDispatcher(
				() => {},
				setup,
				() => {},
			);
			const event = createEvent();

			bind(event, dispatcher);

			expect(setup).not.toHaveBeenCalled();

			link({
				clock: {
					subject: event,
				},
				target: () => {},
			});

			expect(setup).toHaveBeenCalledTimes(1);

			link({
				clock: {
					subject: event,
				},
				target: () => {},
			});

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("stops the dispatcher when all links are unlinked from the subject ", () => {
			const cleanup = jest.fn();
			const dispatcher = createDispatcher(
				() => {},
				(ctrl) => {
					ctrl.cleanup(cleanup);
				},
				() => {},
			);
			const event = createEvent();

			bind(event, dispatcher);

			const links = [
				link({
					clock: {
						subject: event,
					},
					target: () => {},
				}),

				link({
					clock: {
						subject: event,
					},
					target: () => {},
				}),

				link({
					clock: {
						subject: event,
					},
					target: () => {},
				}),
			] as const;

			unlink(links[0]);
			expect(cleanup).not.toHaveBeenCalled();

			unlink(links[2]);
			expect(cleanup).not.toHaveBeenCalled();

			unlink(links[1]);
			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});
});
