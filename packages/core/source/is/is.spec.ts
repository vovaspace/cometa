import { createChannel } from "../channel";
import { createDispatcher } from "../dispatcher";
import { createEffect } from "../effect";
import { createEvent } from "../event";
import { createStore } from "../store";
import { createStream } from "../stream";
import { createSubscriber } from "../subscriber";
import {
	isChannel,
	isDispatcher,
	isEffect,
	isEvent,
	isStore,
	isStream,
	isSubscriber,
	isWithProtocol,
} from "./is";

describe("is", () => {
	const dispatcher = createDispatcher(
		(ctrl) => ctrl,
		() => {},
		() => {},
	);
	const subscriber = createSubscriber(() => {});
	const channel = createChannel(() => {});
	const event = createEvent();
	const stream = createStream(() => 0);
	const store = createStore(0);
	const effect = createEffect(() => {});

	describe("isWithProtocol", () => {
		it("checks that with a protocol", () => {
			expect(isWithProtocol(dispatcher)).toBe(true);
			expect(isWithProtocol(subscriber)).toBe(true);
			expect(isWithProtocol(channel)).toBe(true);
			expect(isWithProtocol(event)).toBe(true);
			expect(isWithProtocol(stream)).toBe(true);
			expect(isWithProtocol(store)).toBe(true);
			expect(isWithProtocol(effect)).toBe(true);

			expect(isWithProtocol({})).toBe(false);
			expect(isWithProtocol({ protocol: true })).toBe(false);
			expect(isWithProtocol({ protocol: { unknown: true } })).toBe(false);
			expect(isWithProtocol(() => {})).toBe(false);
			expect(isWithProtocol(null)).toBe(false);
			expect(isWithProtocol(true)).toBe(false);
		});
	});

	describe("isDispatcher", () => {
		it("checks that a dispatcher", () => {
			expect(isDispatcher(dispatcher)).toBe(true);

			expect(isDispatcher(subscriber)).toBe(false);
			expect(isDispatcher(channel)).toBe(false);
			expect(isDispatcher(event)).toBe(false);
			expect(isDispatcher(stream)).toBe(false);
			expect(isDispatcher(store)).toBe(false);
			expect(isDispatcher(effect)).toBe(false);
		});
	});

	describe("isSubscriber", () => {
		it("checks that a subscriber", () => {
			expect(isSubscriber(subscriber)).toBe(true);

			expect(isSubscriber(dispatcher)).toBe(false);
			expect(isSubscriber(channel)).toBe(false);
			expect(isSubscriber(event)).toBe(false);
			expect(isSubscriber(stream)).toBe(false);
			expect(isSubscriber(store)).toBe(false);
			expect(isSubscriber(effect)).toBe(false);
		});
	});

	describe("isChannel", () => {
		it("checks that a channel", () => {
			expect(isChannel(channel)).toBe(true);
			expect(isChannel(event)).toBe(true);
			expect(isChannel(stream)).toBe(true);
			expect(isChannel(store)).toBe(true);
			expect(isChannel(effect)).toBe(true);

			expect(isChannel(subscriber)).toBe(false);
			expect(isChannel(dispatcher)).toBe(false);
		});
	});

	describe("isEvent", () => {
		it("checks that an event", () => {
			expect(isEvent(event)).toBe(true);
			expect(isEvent(store)).toBe(true);
			expect(isEvent(effect)).toBe(true);

			expect(isEvent(subscriber)).toBe(false);
			expect(isEvent(dispatcher)).toBe(false);
			expect(isEvent(channel)).toBe(false);
			expect(isEvent(stream)).toBe(false);
		});
	});

	describe("isStream", () => {
		it("checks that a stream", () => {
			expect(isStream(stream)).toBe(true);
			expect(isStream(store)).toBe(true);

			expect(isStream(subscriber)).toBe(false);
			expect(isStream(dispatcher)).toBe(false);
			expect(isStream(event)).toBe(false);
			expect(isStream(channel)).toBe(false);
			expect(isStream(effect)).toBe(false);
		});
	});

	describe("isStore", () => {
		it("checks that a stream", () => {
			expect(isStore(store)).toBe(true);

			expect(isStore(subscriber)).toBe(false);
			expect(isStore(dispatcher)).toBe(false);
			expect(isStore(event)).toBe(false);
			expect(isStore(channel)).toBe(false);
			expect(isStore(stream)).toBe(false);
			expect(isStore(effect)).toBe(false);
		});
	});

	describe("isEffect", () => {
		it("checks that an effect", () => {
			expect(isEffect(effect)).toBe(true);

			expect(isEffect(subscriber)).toBe(false);
			expect(isEffect(dispatcher)).toBe(false);
			expect(isEffect(event)).toBe(false);
			expect(isEffect(channel)).toBe(false);
			expect(isEffect(stream)).toBe(false);
			expect(isEffect(store)).toBe(false);
		});
	});
});
