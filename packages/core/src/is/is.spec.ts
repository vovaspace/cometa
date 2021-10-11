import { createEffect } from '../effect';
import { createEvent } from '../event';
import { createStore } from '../store';
import { is } from './is';

describe('is', () => {
  it('checks that it is an unit', () => {
    expect(is.unit(createStore(0))).toBe(true);
    expect(is.unit(createEvent())).toBe(true);
    expect(is.unit(createEffect(() => {}))).toBe(true);

    expect(is.unit(1)).toBe(false);
    expect(is.unit('str')).toBe(false);
    expect(is.unit({})).toBe(false);
    expect(is.unit(null)).toBe(false);
    expect(is.unit(undefined)).toBe(false);
    expect(is.unit(true)).toBe(false);
  });

  it('checks that it is a store', () => {
    expect(is.store(createStore(0))).toBe(true);
    expect(is.store(createEvent())).toBe(false);
    expect(is.store(createEffect(() => {}))).toBe(false);
  });

  it('checks that it is an event', () => {
    expect(is.event(createEvent())).toBe(true);
    expect(is.event(createStore(0))).toBe(true);
    expect(is.event(createEffect(() => {}))).toBe(true);
  });

  it('checks that it is an effect', () => {
    expect(is.effect(createEffect(() => {}))).toBe(true);
    expect(is.effect(createStore(0))).toBe(false);
    expect(is.effect(createEvent())).toBe(false);
  });
});
