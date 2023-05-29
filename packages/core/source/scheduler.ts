import { type Channel, type ChannelPayload } from "./channel";
import { type Dispatcher } from "./dispatcher";
import { hydration } from "./hydration";
import { isDispatcher, isEffect, isSubscriber, isWithProtocol } from "./is";
import {
	graph,
	Link,
	LinkClock,
	LinkMap,
	LinkSource,
	MappingLink,
} from "./link";
import { type Stream } from "./stream";
import { type Subscriber } from "./subscriber";

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

const dispatchers: Dispatcher<unknown>[] = [];
const redispatch = (a: Dispatcher<unknown>, b: Dispatcher<unknown>): number =>
	a.order - b.order;

let subscribers = new Map<Subscriber<any>, unknown>();

const noop = (): void => {};

function perform(
	link: Link<LinkClock<Channel<any>, any>, LinkSource<Stream<any>, any>, any>,
	payload: any,
	shallow: boolean,
): void {
	const target = link.target;

	if (isWithProtocol(target)) {
		if (isDispatcher(target)) {
			if (target.dequeued) {
				target.dequeued = false;
				dispatchers.push(target);
				dispatchers.sort(redispatch);
			}
		} else if (isSubscriber(target)) subscribers.set(target, payload);
		else if (shallow) {
		} else if (isEffect(target)) {
			const result = invoke(link, payload);
			if (result instanceof Promise) result.catch(noop);
		} else invoke(link, payload);
	} else if (!shallow) invoke(link, payload);
}

const sourced: [link: Link<any, any, any>, payload: unknown][] = [];

let level = 0;

function dequeue(force: boolean, shallow: boolean): void {
	level++;

	if (force || dispatchers.length > 0) {
		let current: Dispatcher<unknown> | undefined;
		while ((current = dispatchers.shift())) {
			current.dequeued = true;
			current();
		}
	}

	if (sourced.length > 0) {
		let current: [link: Link<any, any, any>, payload: unknown] | undefined;
		while ((current = sourced.shift())) perform(current[0], current[1], shallow);
	}

	level--;

	if (dispatchers.length > 0) dequeue(true, shallow);
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

	const hydrating = hydration.hydrating;

	const links = graph.get(subject);
	if (links && links.length > 0) {
		for (let i = 0, length = links.length; i < length; i++) {
			const link = links[i]!;
			if (link.source) sourced.push([link, payload]);
			else perform(link, payload, hydrating);
		}
	}

	if (--level === 0) dequeue(false, hydrating);
}
