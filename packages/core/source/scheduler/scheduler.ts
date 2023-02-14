import { type Channel, type ChannelPayload } from "../channel";
import { type Dispatcher } from "../dispatcher";
import { isDispatcher, isEffect, isSubscriber, isWithProtocol } from "../is";
import { lifecycle } from "../lifecycle";
import { type Stream, type StreamState } from "../stream";
import { noop } from "../stub";
import { type Subscriber } from "../subscriber";

type SubjectGuard<Payload, Target extends Payload> = (
	payload: Payload,
) => payload is Target;

type LinkClock<
	Subject extends Channel<any>,
	Output extends ChannelPayload<Subject>,
> = {
	subject: Subject;
	guard?: SubjectGuard<ChannelPayload<Subject>, Output>;
};

type LinkClockOutput<LC> = LC extends LinkClock<any, infer T> ? T : never;

type LinkSource<
	Subject extends Stream<any>,
	Output extends StreamState<Subject>,
> = {
	subject: Subject;
	guard?: SubjectGuard<StreamState<Subject>, Output>;
};

type LinkSourceOutput<LS> = LS extends LinkSource<any, infer T> ? T : never;

type LinkTarget<Payload> = (payload: Payload) => void;

type LinkFilter<Payload, Source> = (
	payload: void extends Payload ? void : Payload,
	source: Source,
) => boolean;

type LinkMap<Payload, Source, Output> = (
	payload: void extends Payload ? void : Payload,
	source: Source,
) => Output;

type ForwardingLink<
	Clock extends LinkClock<any, any>,
	Source extends LinkSource<any, any>,
> = {
	clock: Clock;
	source?: Source;
	filter?: LinkFilter<LinkClockOutput<Clock>, LinkSourceOutput<Source>>;
	target: LinkTarget<LinkClockOutput<Clock>> | LinkTarget<void>;
};

type MappingLink<
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

function invoke(
	link: Link<LinkClock<Channel<any>, any>, LinkSource<Stream<any>, any>, any>,
	payload: any,
): unknown {
	const cg = link.clock.guard;
	if (cg && !cg(payload)) return;

	let source = null;

	const s = link.source;
	if (s) {
		source = s.subject.read();
		const sg = s.guard;
		if (sg && !sg(source)) return;
	}

	const f = link.filter;
	if (
		f &&
		!(f.length === 2 ? f(payload, source) : (f as (p: any) => boolean)(payload))
	)
		return;

	const m = (link as MappingLink<any, any, any>).map as
		| LinkMap<any, any, any>
		| undefined;

	return link.target(
		m
			? m.length === 2
				? m(payload, source)
				: (m as (p: any) => any)(payload)
			: payload,
	);
}

const bindings = new WeakMap<Channel<unknown>, Dispatcher>();

export function bind(subject: Channel<unknown>, dispatcher: Dispatcher): void {
	bindings.set(subject, dispatcher);
}

const graph = new WeakMap<Channel<unknown>, Link<any, any, any>[]>();

export function link<
	ClockSubject extends Channel<any>,
	ClockOutput extends ChannelPayload<ClockSubject>,
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
	let current = graph.get(link.clock.subject);

	if (current) {
		current.push(link);
	} else {
		current = [link];
		graph.set(link.clock.subject, current);
	}

	if (current.length === 1) {
		const dispatcher = bindings.get(link.clock.subject);
		if (dispatcher) dispatcher();
	}

	return lifecycle.current.link(link);
}

export function unlink(link: Link<any, any, any>): void {
	const current = graph.get(link.clock.subject);

	if (current) {
		const index = current!.indexOf(link);

		if (index > -1) {
			current!.splice(index, 1);

			if (current!.length === 0) {
				const dispatcher = bindings.get(link.clock.subject);
				if (dispatcher) dispatcher.stop();
			}
		}
	}
}

const dispatchers: Dispatcher[] = [];
const redispatch = (a: Dispatcher, b: Dispatcher): number => a.order - b.order;

let subscribers = new Map<Subscriber<unknown>, unknown>();

export interface Context {
	inFlight: number;
	errors: unknown[];
}

function perform(
	link: Link<LinkClock<Channel<any>, any>, LinkSource<Stream<any>, any>, any>,
	payload: any,
): void {
	const target = link.target;

	if (!isWithProtocol(target)) invoke(link, payload);
	else if (isDispatcher(target)) {
		if (target.dequeued) {
			target.dequeued = false;
			dispatchers.push(target);
			dispatchers.sort(redispatch);
		}
	} else if (isEffect(target)) {
		const result = invoke(link, payload);
		if (result instanceof Promise) result.catch(noop);
	} else if (isSubscriber(target)) subscribers.set(target, payload);
	else invoke(link, payload);
}

const sourced: [link: Link<any, any, any>, payload: unknown][] = [];

let level = 0;

function dequeue(force: boolean): void {
	level++;

	if (force || dispatchers.length > 0) {
		let current: Dispatcher | undefined;
		while ((current = dispatchers.shift())) {
			current.dequeued = true;
			current();
		}
	}

	if (sourced.length > 0) {
		let current: [link: Link<any, any, any>, payload: unknown] | undefined;
		while ((current = sourced.shift())) perform(current[0], current[1]);
	}

	level--;

	if (dispatchers.length > 0) dequeue(true);
	else if (subscribers.size > 0) {
		subscribers.forEach((p, s) => s(p));
		subscribers = new Map();
	}
}

export function notify(subject: Channel<void>, payload?: never): void;

export function notify<Subject extends Channel<any>>(
	subject: Subject,
	payload: ChannelPayload<Subject>,
): void;

export function notify<Subject extends Channel<any>>(
	subject: Subject,
	payload: ChannelPayload<Subject>,
): void {
	level++;

	const links = graph.get(subject);
	if (links && links.length > 0) {
		for (let i = 0, length = links.length; i < length; i++) {
			const link = links[i]!;
			if (link.source) sourced.push([link, payload]);
			else perform(link, payload);
		}
	}

	if (--level === 0) dequeue(false);
}
