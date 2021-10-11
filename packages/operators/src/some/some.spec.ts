import { createStore } from '@cometa/core';
import { some } from './some';

describe('some', () => {
  it('derives a store', () => {
    const subscriber = jest.fn();

    const $first = createStore(0);
    const $second = createStore(0);

    const $some = some([$first, $second], (value) => value > 0);
    $some.subscribe(subscriber);

    expect(subscriber).toHaveBeenLastCalledWith(false);

    $first.set(1);
    expect(subscriber).toHaveBeenLastCalledWith(true);

    $first.set(0);
    expect(subscriber).toHaveBeenLastCalledWith(false);

    $second.set(1);
    expect(subscriber).toHaveBeenLastCalledWith(true);

    $second.set(0);
    expect(subscriber).toHaveBeenLastCalledWith(false);

    $first.set(1);
    $second.set(1);
    expect(subscriber).toHaveBeenLastCalledWith(true);
  });
});
