import { type Channel } from "../channel";
import { context } from "../context";
import { createEvent, type Event, type EventProtocol } from "../event";
import { lifecycle } from "../lifecycle";
import { link, notify, unlink } from "../scheduler";
import { createStore } from "../store";
import { type Stream } from "../stream";
import { back } from "../stub";

export interface EffectProtocol extends EventProtocol {
	effect: true;
}

export enum EffectStatus {
	Fulfilled = "fulfilled",
	Rejected = "rejected",
}

export interface EffectLaunchedPayload<Payload> {
	payload: Payload;
}

export interface EffectFulfilledPayload<Payload, Result> {
	status: EffectStatus.Fulfilled;
	payload: Payload;
	result: Result;
}

export interface EffectRejectedPayload<Payload, Err> {
	status: EffectStatus.Rejected;
	payload: Payload;
	error: Err;
}

export type EffectSettledPayload<Payload, Result, Err> =
	| EffectFulfilledPayload<Payload, Result>
	| EffectRejectedPayload<Payload, Err>;

export interface Effect<Payload = void, Result = void, Err = Error>
	extends Event<Payload> {
	(payload: Payload): Promise<Result>;
	protocol: EffectProtocol;
	inFlight: Stream<number>;
	launched: Channel<EffectLaunchedPayload<Payload>>;
	fulfilled: Channel<EffectFulfilledPayload<Payload, Result>>;
	rejected: Channel<EffectRejectedPayload<Payload, Err>>;
	settled: Channel<EffectSettledPayload<Payload, Result, Err>>;
	payloaded: Channel<Payload>;
	resulted: Channel<Result>;
	failed: Channel<Err>;
}

export type EffectPayload<Fx> = Fx extends Effect<infer T, any, any>
	? T
	: never;
export type EffectResult<Fx> = Fx extends Effect<any, infer T, any> ? T : never;
export type EffectError<Fx> = Fx extends Effect<any, any, infer T> ? T : never;

const repayload = <Payload>(payload: { payload: Payload }): Payload =>
	payload.payload;
const reresult = <Result>(payload: { result: Result }): Result =>
	payload.result;
const increase = (_: unknown, source: number): number => source + 1;
const decrease = (_: unknown, source: number): number => source - 1;

const protocol: EffectProtocol = {
	cometa: true,
	channel: true,
	event: true,
	effect: true,
} as const;

export function createEffect<Payload = void, Result = void, Err = Error>(
	handler: (payload: Payload) => Result | Promise<Result>,
): Effect<Payload, Result, Err> {
	const current = lifecycle.current;
	const original = current.subject;

	current.subject = back;

	const inFlight = createStore(0);
	const launched = createEvent<EffectLaunchedPayload<Payload>>();
	const fulfilled = createEvent<EffectFulfilledPayload<Payload, Result>>();
	const rejected = createEvent<EffectRejectedPayload<Payload, Err>>();
	const settled = createEvent<EffectSettledPayload<Payload, Result, Err>>();
	const payloaded = createEvent<Payload>();
	const resulted = createEvent<Result>();
	const failed = createEvent<Err>();

	const effect: Effect<Payload, Result, Err> = async (payload) => {
		const current = context.current;

		current.inFlight++;
		notify(effect, payload);

		try {
			const promise = handler(payload);
			launched({ payload });

			const result = await promise;

			current.inFlight--;
			context.current = current;

			fulfilled({ status: EffectStatus.Fulfilled, payload, result });

			return result;
		} catch (error) {
			current.inFlight--;
			current.error(error);
			context.current = current;

			rejected({
				status: EffectStatus.Rejected,
				payload,
				error: error as Err,
			});

			throw error;
		}
	};

	effect.listen = (listener) => {
		const l = link({
			clock: { subject: effect },
			target: listener,
		});

		return () => unlink(l);
	};

	link({
		clock: { subject: launched },
		map: repayload,
		target: payloaded,
	});

	link({
		clock: { subject: fulfilled },
		target: settled,
	});
	link({
		clock: { subject: fulfilled },
		map: reresult,
		target: resulted,
	});

	link({
		clock: { subject: rejected },
		target: settled,
	});
	link({
		clock: { subject: rejected },
		map: (payload) => payload.error,
		target: failed,
	});

	link({
		clock: { subject: effect },
		source: { subject: inFlight },
		map: increase,
		target: inFlight,
	});
	link({
		clock: { subject: settled },
		source: { subject: inFlight },
		map: decrease,
		target: inFlight,
	});

	effect.inFlight = inFlight;
	effect.launched = launched;
	effect.fulfilled = fulfilled;
	effect.rejected = rejected;
	effect.settled = settled;
	effect.payloaded = payloaded;
	effect.resulted = resulted;
	effect.failed = failed;

	effect.protocol = protocol;

	current.subject = original;

	return original(effect);
}

export const effect = createEffect;
