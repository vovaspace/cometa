import { type Channel } from "./channel";
import { type Dispatcher } from "./dispatcher";
import { type Model, ModelSymbol } from "./model";
import { type WithProtocol } from "./protocol";
import { type Routine } from "./routine";
import { type Store } from "./store";
import { type Stream } from "./stream";
import { type Subscriber } from "./subscriber";
import { type Thread } from "./thread";

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

export const isThread = <Payload>(
	unknown: Thread<Payload> | WithProtocol,
): unknown is Thread<Payload> => "thread" in unknown.protocol;

export const isChannel = <Payload>(
	unknown: Channel<Payload> | WithProtocol,
): unknown is Channel<Payload> => "channel" in unknown.protocol;

export const isStream = <State>(
	unknown: Stream<State> | WithProtocol,
): unknown is Stream<State> => "stream" in unknown.protocol;

export const isStore = <State>(
	unknown: Store<State> | WithProtocol,
): unknown is Store<State> => "store" in unknown.protocol;

export const isRoutine = <Payload, Result, Error>(
	unknown: Routine<Payload, Result, Error> | WithProtocol,
): unknown is Routine<Payload, Result, Error> => "routine" in unknown.protocol;

export const isModel = <Shape extends {}>(
	unknown: Model<Shape> | unknown,
): unknown is Model<Shape> =>
	typeof unknown === "object" && unknown !== null && ModelSymbol in unknown;
