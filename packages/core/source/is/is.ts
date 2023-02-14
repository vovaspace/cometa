import { type Channel } from "../channel";
import { type Dispatcher } from "../dispatcher";
import { type Effect } from "../effect";
import { type Event } from "../event";
import { type WithProtocol } from "../protocol";
import { type Store } from "../store";
import { type Stream } from "../stream";
import { type Subscriber } from "../subscriber";

export const isWithProtocol = (unknown: unknown): unknown is WithProtocol =>
	(typeof unknown === "function" ||
		(typeof unknown === "object" && unknown !== null)) &&
	"protocol" in unknown &&
	typeof unknown.protocol === "object" &&
	unknown.protocol !== null &&
	"cometa" in unknown.protocol;

export const isDispatcher = (unknown: WithProtocol): unknown is Dispatcher =>
	"dispatcher" in unknown.protocol;

export const isSubscriber = (
	unknown: WithProtocol,
): unknown is Subscriber<unknown> => "subscriber" in unknown.protocol;

export const isChannel = (unknown: WithProtocol): unknown is Channel<unknown> =>
	"channel" in unknown.protocol;

export const isEvent = (unknown: WithProtocol): unknown is Event<unknown> =>
	"event" in unknown.protocol;

export const isStream = (unknown: WithProtocol): unknown is Stream<unknown> =>
	"stream" in unknown.protocol;

export const isStore = (unknown: WithProtocol): unknown is Store<unknown> =>
	"store" in unknown.protocol;

export const isEffect = (
	unknown: WithProtocol,
): unknown is Effect<unknown, unknown, unknown> => "effect" in unknown.protocol;
