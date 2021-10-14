import { createFlow, createStore } from '@cometa/core';
import { compute } from './compute';

describe('compute', () => {
  it('derives a single', () => {
    const $store = createStore(0);
    const $computed = compute($store, Boolean);

    expect($computed.value()).toBe(false);

    $store.set(1);
    expect($computed.value()).toBe(true);
  });

  it('combines multiple', () => {
    const $first = createStore('f');

    const reader = jest.fn().mockReturnValue(0);
    const $second = createFlow(reader);

    const $computed = compute(
      [$first, $second],
      (first, second) => `${first}${second}`,
    );

    expect($computed.value()).toBe('f0');

    $first.set('s');
    expect($computed.value()).toBe('s0');

    reader.mockReturnValueOnce(1);
    expect($computed.value()).toBe('s1');
  });

  it('solves the diamond problem', () => {
    const $root = createStore('A B');

    const $first = compute($root, (root) => root.split(' ')[0]);
    const $second = compute($root, (root) => root.split(' ')[1]);

    const $end = compute(
      [$first, $second],
      (first, second) => `${first} ${second}`,
    );

    const watcher = jest.fn();
    $end.watch(watcher);

    $root.set('C D');

    expect(watcher).toHaveBeenCalledTimes(1);
  });
});
