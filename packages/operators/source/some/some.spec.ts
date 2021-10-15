import { createFlow, createStore } from '@cometa/core';
import { some } from './some';

describe('some', () => {
  it('derives a flow', () => {
    const reader = jest.fn().mockReturnValue(0);

    const $first = createStore(0);
    const $second = createFlow(reader);

    const $derived = some([$first, $second], (value) => value > 0);

    expect($derived.value()).toBe(false);

    $first.set(1);
    expect($derived.value()).toBe(true);

    $first.set(0);
    expect($derived.value()).toBe(false);

    reader.mockReturnValueOnce(1);
    expect($derived.value()).toBe(true);
    expect($derived.value()).toBe(false);

    $first.set(1);
    reader.mockReturnValueOnce(1);
    expect($derived.value()).toBe(true);
  });
});
