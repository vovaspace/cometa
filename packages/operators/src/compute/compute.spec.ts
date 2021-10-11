import { createStore } from '@cometa/core';
import { compute } from './compute';

describe('compute', () => {
  it('derives a single store', () => {
    const $store = createStore(0);
    const $computed = compute($store, Boolean);

    expect($computed.value()).toBe(false);

    $store.set(1);
    expect($computed.value()).toBe(true);
  });

  it('combines multiple stores', () => {
    const $first = createStore('f');
    const $second = createStore(0);

    const $computed = compute(
      [$first, $second],
      (first, second) => `${first}${second}`,
    );

    expect($computed.value()).toBe('f0');

    $first.set('s');
    expect($computed.value()).toBe('s0');

    $second.set(1);
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
