import { createEvent, createStore } from '@cometa/core';
import { merge } from './merge';

describe('merge', () => {
  it('merges', () => {
    const watcher = jest.fn();
    const $store = createStore(0);
    const event = createEvent<number>();

    event.watch(watcher);
    const merged = merge($store, event);

    merged(1);

    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenCalledWith(1);
    expect($store.value()).toBe(1);
  });
});
