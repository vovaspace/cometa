import { createStore } from '../store';
import { hydrate } from './hydrate';

describe('hydrate', () => {
  it('hydrates', () => {
    const $first = createStore(0);
    const $second = createStore(0);
    const $fourth = createStore(0);

    hydrate({
      0: 1,
      2: 4,
      4: 6,
    });

    const $fifth = createStore(0);
    const $sixth = createStore(0);

    expect($first.value()).toBe(1);
    expect($second.value()).toBe(0);
    expect($fourth.value()).toBe(4);
    expect($fifth.value()).toBe(0);
    expect($sixth.value()).toBe(6);
  });
});
