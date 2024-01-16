import { channel, type Channel, type ChannelProtocol } from "./channel";
import { context } from "./context";
import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { notify } from "./scheduler";
import { store } from "./store";
import { type Stream } from "./stream";
import { type Thread } from "./thread";

export interface RoutineProtocol extends ChannelProtocol {
	routine: true;
}

export enum RoutineStatus {
	Fulfilled = "fulfilled",
	Rejected = "rejected",
}

export interface RoutineLaunchedPayload<Payload> {
	payload: Payload;
}

export interface RoutineFulfilledPayload<Payload, Result> {
	status: RoutineStatus.Fulfilled;
	payload: Payload;
	result: Result;
}

export interface RoutineRejectedPayload<Payload, Err> {
	status: RoutineStatus.Rejected;
	payload: Payload;
	error: Err;
}

export type RoutineSettledPayload<Payload, Result, Err> =
	| RoutineFulfilledPayload<Payload, Result>
	| RoutineRejectedPayload<Payload, Err>;

export interface Routine<Payload = void, Result = void, Err = Error>
	extends Channel<Payload> {
	(payload: Payload): Promise<Result>;
	protocol: RoutineProtocol;
	inFlight: Stream<number>;
	launched: Thread<RoutineLaunchedPayload<Payload>>;
	fulfilled: Thread<RoutineFulfilledPayload<Payload, Result>>;
	rejected: Thread<RoutineRejectedPayload<Payload, Err>>;
	settled: Thread<RoutineSettledPayload<Payload, Result, Err>>;
	payloaded: Thread<Payload>;
	resulted: Thread<Result>;
	failed: Thread<Err>;
}

export type RoutinePayload<R> = R extends Routine<infer T, any, any>
	? T
	: never;
export type RoutineResult<R> = R extends Routine<any, infer T, any> ? T : never;
export type RoutineError<R> = R extends Routine<any, any, infer T> ? T : never;

const repayload = <Payload>(payload: { payload: Payload }): Payload =>
	payload.payload;
const reresult = <Result>(payload: { result: Result }): Result =>
	payload.result;
const increase = (_: unknown, source: number): number => source + 1;
const decrease = (_: unknown, source: number): number => source - 1;

const protocol: RoutineProtocol = {
	cometa: true,
	thread: true,
	channel: true,
	routine: true,
} as const;

const identity = <T>(input: T): T => input;

function createRoutine<Payload = void, Result = void, Err = Error>(
	handler: (payload: Payload) => Result | Promise<Result>,
): Routine<Payload, Result, Err> {
	const current = lifecycle.current;
	const original = current.subject;

	current.subject = identity;

	const inFlight = store(0, { serialization: false });
	const launched = channel<RoutineLaunchedPayload<Payload>>();
	const fulfilled = channel<RoutineFulfilledPayload<Payload, Result>>();
	const rejected = channel<RoutineRejectedPayload<Payload, Err>>();
	const settled = channel<RoutineSettledPayload<Payload, Result, Err>>();
	const payloaded = channel<Payload>();
	const resulted = channel<Result>();
	const failed = channel<Err>();

	const routine: Routine<Payload, Result, Err> = async (payload) => {
		const current = context.current;

		current.inFlight++;
		notify(routine, payload);

		try {
			const promise = handler(payload);
			launched({ payload });

			const result = await promise;

			current.inFlight--;
			context.current = current;

			fulfilled({ status: RoutineStatus.Fulfilled, payload, result });

			return result;
		} catch (error) {
			current.inFlight--;
			current.error(error);
			context.current = current;

			rejected({
				status: RoutineStatus.Rejected,
				payload,
				error: error as Err,
			});

			throw error;
		}
	};

	routine.listen = (listener) => {
		const l = link({
			clock: { subject: routine },
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
		clock: { subject: routine },
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

	routine.inFlight = inFlight;
	routine.launched = launched;
	routine.fulfilled = fulfilled;
	routine.rejected = rejected;
	routine.settled = settled;
	routine.payloaded = payloaded;
	routine.resulted = resulted;
	routine.failed = failed;

	routine.protocol = protocol;

	current.subject = original;

	return original(routine);
}

export const routine = createRoutine;
