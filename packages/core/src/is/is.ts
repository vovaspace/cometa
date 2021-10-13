import { AnyEffect } from '../effect';
import { AnyEvent } from '../event';
import { AnyFlow } from '../flow';
import { AnyStore } from '../store';

const base = (unknown: unknown): unknown is Record<string, unknown> =>
  typeof unknown === 'function' ||
  (typeof unknown === 'object' && unknown !== null);

const effect = (unknown: unknown): unknown is AnyEffect =>
  base(unknown) && unknown.effect === true;

const event = (unknown: unknown): unknown is AnyEvent =>
  base(unknown) && unknown.event === true;

const flow = (unknown: unknown): unknown is AnyFlow =>
  base(unknown) && unknown.flow === true;

const store = (unknown: unknown): unknown is AnyStore =>
  base(unknown) && unknown.store === true;

export const is = {
  effect,
  event,
  flow,
  store,
};
