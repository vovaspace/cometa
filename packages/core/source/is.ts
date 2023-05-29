import { type Channel } from "./channel";
import { type Dispatcher } from "./dispatcher";
import { type Effect } from "./effect";
import { type Event } from "./event";
import { type Instance, InstanceSymbol } from "./factory";
import { type WithProtocol } from "./protocol";
import { type Store } from "./store";
import { type Stream } from "./stream";
import { type Subscriber } from "./subscriber";

export const isWithProtocol = (unknown: unknown): unknown is WithProtocol =>
	(typeof unknown === "function" ||
		(typeof unknown === "object" && unknown !== null)) &&
	"protocol" in unknown &&
	typeof unknown.protocol === "object" &&
	unknown.protocol !== null &&
	"cometa" in unknown.protocol;

export const isDispatcher = <Result>(
	unknown: Dispatcher<Result> | WithProtocol,
): unknown is Dispatcher<Result> => "dispatcher" in unknown.protocol;

export const isSubscriber = <Payload>(
	unknown: Subscriber<Payload> | WithProtocol,
): unknown is Subscriber<Payload> => "subscriber" in unknown.protocol;

export const isChannel = <Payload>(
	unknown: Channel<Payload> | WithProtocol,
): unknown is Channel<Payload> => "channel" in unknown.protocol;

export const isEvent = <Payload>(
	unknown: Event<Payload> | WithProtocol,
): unknown is Event<Payload> => "event" in unknown.protocol;

export const isStream = <State>(
	unknown: Stream<State> | WithProtocol,
): unknown is Stream<State> => "stream" in unknown.protocol;

export const isStore = <State>(
	unknown: Store<State> | WithProtocol,
): unknown is Store<State> => "store" in unknown.protocol;

export const isEffect = <Payload, Result, Error>(
	unknown: Effect<Payload, Result, Error> | WithProtocol,
): unknown is Effect<Payload, Result, Error> => "effect" in unknown.protocol;

export const isInstance = <Shape extends {}>(
	unknown: Instance<Shape> | unknown,
): unknown is Instance<Shape> =>
	typeof unknown === "object" && unknown !== null && InstanceSymbol in unknown;
