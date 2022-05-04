import { cleanup } from '../cleanup';
import { createFlow } from './flow';

describe('flow', () => {
  it('returns a reader result if it is not active', () => {
    const reader = jest.fn().mockReturnValue(1);

    const $flow = createFlow(reader);

    expect($flow.value()).toBe(1);

    reader.mockReturnValueOnce(2);
    expect($flow.value()).toBe(2);
  });

  it('emits if an reader result was changed', () => {
    const reader = jest.fn().mockReturnValue(1);
    const watcher = jest.fn();

    const $flow = createFlow(reader);
    $flow.watch(watcher);

    $flow.value();
    expect(watcher).not.toHaveBeenCalled();

    $flow.value();
    expect(watcher).not.toHaveBeenCalled();

    reader.mockReturnValueOnce(2);
    $flow.value();
    expect(watcher).toHaveBeenCalledWith(2);
  });

  it('runs a notifier on watcher is added', () => {
    const notifier = jest.fn();
    const $flow = createFlow(() => 0, notifier);

    expect(notifier).not.toHaveBeenCalled();

    $flow.watch(() => {});

    expect(notifier).toHaveBeenCalledTimes(1);
  });

  it('is not read if it is active', () => {
    const reader = jest.fn().mockReturnValue(1);
    const $flow = createFlow(reader, () => {});

    const unwatch = $flow.watch(() => {});

    reader.mockReturnValueOnce(2);
    expect($flow.value()).toBe(1);

    unwatch();

    expect($flow.value()).toBe(2);
  });

  it('cleanups after all watchers are unwatched', () => {
    const notifier = jest.fn();
    const $flow = createFlow(
      () => 0,
      () => {
        cleanup(notifier);
      },
    );

    const unwatch = $flow.watch(() => {});
    expect(notifier).not.toHaveBeenCalled();

    unwatch();
    expect(notifier).toHaveBeenCalledTimes(1);
  });

  it('reinitializes', () => {
    const notifier = jest.fn();
    const $flow = createFlow(() => 0, notifier);

    const unwatch = $flow.watch(() => {});
    unwatch();
    $flow.watch(() => {});

    expect(notifier).toHaveBeenCalledTimes(2);
  });
});
