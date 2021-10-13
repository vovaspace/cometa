import { createEffect } from '../effect';
import { createEvent } from '../event';
import { createFlow } from '../flow';
import { createStore } from '../store';
import { is } from './is';

describe('is', () => {
  it('checks that it is a flow', () => {
    expect(is.flow(createFlow(() => 0))).toBe(true);
    expect(is.flow(createStore(0))).toBe(true);
    expect(is.flow(createEvent())).toBe(false);
    expect(is.flow(createEffect(() => {}))).toBe(false);
  });

  it('checks that it is a store', () => {
    expect(is.store(createStore(0))).toBe(true);
    expect(is.store(createFlow(() => 0))).toBe(false);
    expect(is.store(createEvent())).toBe(false);
    expect(is.store(createEffect(() => {}))).toBe(false);
  });

  it('checks that it is an event', () => {
    expect(is.event(createEvent())).toBe(true);
    expect(is.event(createStore(0))).toBe(true);
    expect(is.event(createFlow(() => 0))).toBe(false);
    expect(is.event(createEffect(() => {}))).toBe(true);
  });

  it('checks that it is an effect', () => {
    expect(is.effect(createEffect(() => {}))).toBe(true);
    expect(is.effect(createFlow(() => 0))).toBe(false);
    expect(is.effect(createStore(0))).toBe(false);
    expect(is.effect(createEvent())).toBe(false);
  });
});
