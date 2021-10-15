import { createEvent } from '@cometa/core';
import { prepend } from './prepend';

describe('prepend', () => {
  it('prepends', () => {
    const watcher = jest.fn();
    const event = createEvent<number>();
    event.watch(watcher);

    const prepended = prepend(event, (payload: number) => payload * 10);
    prepended(1);

    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenCalledWith(10);
  });
});
