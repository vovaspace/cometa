import { createEvent } from '@cometa/core';
import { reflow } from './reflow';

describe('rewflow', () => {
  it('rewflows', () => {
    const event = createEvent<number>();
    const $reflowed = reflow(event, 0);

    expect($reflowed.value()).toBe(0);

    event(1);
    expect($reflowed.value()).toBe(1);
  });
});
