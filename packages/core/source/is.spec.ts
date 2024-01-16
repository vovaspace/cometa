import { channel as createChannel } from "./channel";
import { createDispatcher } from "./dispatcher";
import {
	isChannel,
	isDispatcher,
	isModel,
	isRoutine,
	isStore,
	isStream,
	isSubscriber,
	isThread,
	isWithProtocol,
} from "./is";
import { model as defineModel } from "./model";
import { routine as createRoutine } from "./routine";
import { store as createStore } from "./store";
import { stream as createStream } from "./stream";
import { createSubscriber } from "./subscriber";
import { thread as createThread } from "./thread";

describe("is", () => {
	const thread = createThread(() => {});
	const dispatcher = createDispatcher(
		(ctrl) => ctrl,
		() => {},
		() => {},
	);
	const channel = createChannel();
	const model = defineModel(() => ({}))();
	const routine = createRoutine(() => {});
	const store = createStore(0);
	const stream = createStream(() => 0);
	const subscriber = createSubscriber(() => {});

	describe("isWithProtocol", () => {
		it("checks that with a protocol", () => {
			expect(isWithProtocol(thread)).toBe(true);
			expect(isWithProtocol(dispatcher)).toBe(true);
			expect(isWithProtocol(channel)).toBe(true);
			expect(isWithProtocol(routine)).toBe(true);
			expect(isWithProtocol(store)).toBe(true);
			expect(isWithProtocol(stream)).toBe(true);
			expect(isWithProtocol(subscriber)).toBe(true);

			expect(isWithProtocol(model)).toBe(false);

			expect(isWithProtocol(() => {})).toBe(false);
			expect(isWithProtocol({ protocol: { unknown: true } })).toBe(false);
			expect(isWithProtocol({ protocol: true })).toBe(false);
			expect(isWithProtocol({})).toBe(false);
			expect(isWithProtocol(null)).toBe(false);
			expect(isWithProtocol(true)).toBe(false);
		});
	});

	describe("isDispatcher", () => {
		it("checks that a dispatcher", () => {
			expect(isDispatcher(dispatcher)).toBe(true);

			expect(isDispatcher(thread)).toBe(false);
			expect(isDispatcher(channel)).toBe(false);
			expect(isDispatcher(routine)).toBe(false);
			expect(isDispatcher(store)).toBe(false);
			expect(isDispatcher(stream)).toBe(false);
			expect(isDispatcher(subscriber)).toBe(false);
		});
	});

	describe("isSubscriber", () => {
		it("checks that a subscriber", () => {
			expect(isSubscriber(subscriber)).toBe(true);

			expect(isSubscriber(thread)).toBe(false);
			expect(isSubscriber(dispatcher)).toBe(false);
			expect(isSubscriber(channel)).toBe(false);
			expect(isSubscriber(routine)).toBe(false);
			expect(isSubscriber(store)).toBe(false);
			expect(isSubscriber(stream)).toBe(false);
		});
	});

	describe("isThread", () => {
		it("checks that a thread", () => {
			expect(isThread(thread)).toBe(true);
			expect(isThread(channel)).toBe(true);
			expect(isThread(routine)).toBe(true);
			expect(isThread(store)).toBe(true);
			expect(isThread(stream)).toBe(true);

			expect(isThread(dispatcher)).toBe(false);
			expect(isThread(subscriber)).toBe(false);
		});
	});

	describe("isChannel", () => {
		it("checks that a channel", () => {
			expect(isChannel(channel)).toBe(true);
			expect(isChannel(routine)).toBe(true);
			expect(isChannel(store)).toBe(true);

			expect(isChannel(thread)).toBe(false);
			expect(isChannel(dispatcher)).toBe(false);
			expect(isChannel(stream)).toBe(false);
			expect(isChannel(subscriber)).toBe(false);
		});
	});

	describe("isStream", () => {
		it("checks that a stream", () => {
			expect(isStream(store)).toBe(true);
			expect(isStream(stream)).toBe(true);

			expect(isStream(thread)).toBe(false);
			expect(isStream(dispatcher)).toBe(false);
			expect(isStream(channel)).toBe(false);
			expect(isStream(routine)).toBe(false);
			expect(isStream(subscriber)).toBe(false);
		});
	});

	describe("isStore", () => {
		it("checks that a stream", () => {
			expect(isStore(store)).toBe(true);

			expect(isStore(thread)).toBe(false);
			expect(isStore(dispatcher)).toBe(false);
			expect(isStore(channel)).toBe(false);
			expect(isStore(routine)).toBe(false);
			expect(isStore(stream)).toBe(false);
			expect(isStore(subscriber)).toBe(false);
		});
	});

	describe("isRoutine", () => {
		it("checks that a routine", () => {
			expect(isRoutine(routine)).toBe(true);

			expect(isRoutine(thread)).toBe(false);
			expect(isRoutine(dispatcher)).toBe(false);
			expect(isRoutine(channel)).toBe(false);
			expect(isRoutine(store)).toBe(false);
			expect(isRoutine(stream)).toBe(false);
			expect(isRoutine(subscriber)).toBe(false);
		});
	});

	describe("isModel", () => {
		it("checks that an model instance", () => {
			expect(isModel(model)).toBe(true);

			expect(isModel(dispatcher)).toBe(false);
			expect(isModel(subscriber)).toBe(false);
			expect(isModel(thread)).toBe(false);
			expect(isModel(channel)).toBe(false);
			expect(isModel(stream)).toBe(false);
			expect(isModel(store)).toBe(false);
			expect(isModel(routine)).toBe(false);

			expect(isModel({})).toBe(false);
			expect(isModel({ protocol: true })).toBe(false);
			expect(isModel({ protocol: { unknown: true } })).toBe(false);
			expect(isModel(() => {})).toBe(false);
			expect(isModel(null)).toBe(false);
			expect(isModel(true)).toBe(false);
		});
	});
});
