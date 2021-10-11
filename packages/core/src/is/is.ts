import { AnyEffect } from '../effect';
import { AnyEvent } from '../event';
import { AnyReadableStore } from '../store';
import { AnyUnit } from '../unit';

const unit = (unknown: unknown): unknown is AnyUnit =>
  typeof unknown === 'function' && 'cometa' in unknown;

const store = (unknown: unknown): unknown is AnyReadableStore =>
  unit(unknown) && 'store' in unknown;

const event = (unknown: unknown): unknown is AnyEvent =>
  unit(unknown) && 'event' in unknown;

const effect = (unknown: unknown): unknown is AnyEffect =>
  unit(unknown) && 'effect' in unknown;

export const is = {
  unit,
  store,
  event,
  effect,
};
