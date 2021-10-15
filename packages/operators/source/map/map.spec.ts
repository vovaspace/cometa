import { createEvent } from '@cometa/core';
import { map } from './map';

describe('map', () => {
  it('maps', () => {
    const watcher = jest.fn();
    const event = createEvent<number>();

    const mapped = map(event, (payload: number) => payload * 10);
    mapped.watch(watcher);
    event(1);

    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenCalledWith(10);
  });
});
