import { DispatchersRegistry } from "./dispatcher";
import { lifecycle } from "./lifecycle";
import { type Stream, type StreamState } from "./stream";
import { type Thread, type ThreadPayload } from "./thread";

export type SubjectGuard<Payload, Target extends Payload> = (
	payload: Payload,
) => payload is Target;

export type LinkClock<
	Subject extends Thread<any>,
	Output extends ThreadPayload<Subject>,
> = {
	subject: Subject;
	guard?: SubjectGuard<ThreadPayload<Subject>, Output>;
};

export type LinkClockOutput<LC> = LC extends LinkClock<any, infer T>
	? T
	: never;

export type LinkSource<
	Subject extends Stream<any>,
	Output extends StreamState<Subject>,
> = {
	subject: Subject;
	guard?: SubjectGuard<StreamState<Subject>, Output>;
};

export type LinkSourceOutput<LS> = LS extends LinkSource<any, infer T>
	? T
	: never;

export type LinkTarget<Payload> = (payload: Payload) => void;

export type LinkFilter<Payload, Source> = (
	payload: void extends Payload ? void : Payload,
	source: Source,
) => boolean;

export type LinkMap<Payload, Source, Output> = (
	payload: void extends Payload ? void : Payload,
	source: Source,
) => Output;

export type ForwardingLink<
	Clock extends LinkClock<any, any>,
	Source extends LinkSource<any, any>,
> = {
	clock: Clock;
	source?: Source;
	filter?: LinkFilter<LinkClockOutput<Clock>, LinkSourceOutput<Source>>;
	target: LinkTarget<LinkClockOutput<Clock>> | LinkTarget<void>;
};

export type MappingLink<
	Clock extends LinkClock<any, any>,
	Source extends LinkSource<any, any>,
	Output,
> = {
	clock: Clock;
	source?: Source;
	filter?: LinkFilter<LinkClockOutput<Clock>, LinkSourceOutput<Source>>;
	map: LinkMap<LinkClockOutput<Clock>, LinkSourceOutput<Source>, Output>;
	target: LinkTarget<Output>;
};

export type Link<
	Clock extends LinkClock<any, any>,
	Source extends LinkSource<any, any>,
	Output,
> = ForwardingLink<Clock, Source> | MappingLink<Clock, Source, Output>;

export const graph = new WeakMap<Thread<unknown>, Link<any, any, any>[]>();

export function link<
	ClockSubject extends Thread<any>,
	ClockOutput extends ThreadPayload<ClockSubject>,
	SourceSubject extends Stream<any>,
	SourceOutput extends StreamState<SourceSubject>,
	Output,
>(
	link: Link<
		LinkClock<ClockSubject, ClockOutput>,
		LinkSource<SourceSubject, SourceOutput>,
		Output
	>,
): Link<
	LinkClock<ClockSubject, ClockOutput>,
	LinkSource<SourceSubject, SourceOutput>,
	Output
> {
	const subject = link.clock.subject;
	let current = graph.get(subject);

	if (current) {
		current.push(link);
	} else {
		current = [link];
		graph.set(subject, current);
	}

	if (current.length === 1) {
		const dispatcher = DispatchersRegistry.get(subject);
		if (dispatcher) dispatcher();
	}

	return lifecycle.current.link(link);
}

export function unlink(link: Link<any, any, any>): void {
	const subject = link.clock.subject;
	const current = graph.get(subject);

	if (current) {
		const index = current!.indexOf(link);

		if (index > -1) {
			current!.splice(index, 1);

			if (current!.length === 0) {
				const dispatcher = DispatchersRegistry.get(subject);
				if (dispatcher) dispatcher.stop();
			}
		}
	}
}
