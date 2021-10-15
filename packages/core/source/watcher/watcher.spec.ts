import { createWatcher } from './watcher';

describe('watcher', () => {
  it('watches updates', () => {
    const fn = jest.fn();
    const watcher = createWatcher<number>();

    watcher.watch(fn);
    watcher.emit(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('unwatches updates', () => {
    const fn = jest.fn();
    const watcher = createWatcher<number>();

    const unwatch = watcher.watch(fn);
    unwatch();
    watcher.emit(1);

    expect(fn).not.toHaveBeenCalled();
  });
});
