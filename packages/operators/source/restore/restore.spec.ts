import { createEvent } from '@cometa/core';
import { restore } from './restore';

describe('restore', () => {
  it('restores', () => {
    const event = createEvent<number>();
    const $restored = restore(event, 0);

    expect($restored.value()).toBe(0);

    event(1);
    expect($restored.value()).toBe(1);

    $restored.set(2);
    expect($restored.value()).toBe(2);
  });
});
