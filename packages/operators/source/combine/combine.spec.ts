import { createEvent, createStore } from '@cometa/core';
import { combine } from './combine';

describe('combine', () => {
  it('combines', () => {
    const watcher = jest.fn();
    const $store = createStore(0);
    const event = createEvent<string>();

    const combined = combine($store, event);
    combined.watch(watcher);

    $store.set(1);
    event('2');

    expect(watcher).toHaveBeenCalledTimes(2);
    expect(watcher).toHaveBeenNthCalledWith(1, 1);
    expect(watcher).toHaveBeenNthCalledWith(2, '2');
  });
});
