import { createEffect, createStore, wait } from '@cometa/core';
import { attach } from './attach';

const setup = () => {
  const watcher = jest.fn();
  const effect = createEffect<number>(() => {});
  effect.watch(watcher);
  return [effect, watcher] as const;
};

describe('attach', () => {
  describe('store source', () => {
    it('attaches full-payload source', () => {
      const [effect, watcher] = setup();
      const $number = createStore(0);

      const derived = attach(effect, $number);

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(0);
    });

    it('attaches full-payload source with map', () => {
      const [effect, watcher] = setup();
      const $number = createStore(0);

      const derived = attach(effect, $number, (source) => source + 1);

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(1);
    });

    it('attaches full-payload source with map and payload', () => {
      const [effect, watcher] = setup();
      const $number = createStore(0);

      const derived = attach(
        effect,
        $number,
        (source, payload: number) => source + payload,
      );

      derived(2);

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(2);
    });

    it('attaches source with map', () => {
      const [effect, watcher] = setup();
      const $string = createStore('1');

      const derived = attach(effect, $string, (source) =>
        Number.parseInt(source, 10),
      );

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(1);
    });

    it('attaches source with map and payload', () => {
      const [effect, watcher] = setup();
      const $string = createStore('1');

      const derived = attach(
        effect,
        $string,
        (source, payload: number) => Number.parseInt(source, 10) + payload,
      );

      derived(2);

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(3);
    });
  });

  it("triggers effect's events", async () => {
    expect.assertions(4);

    const doneWatcher = jest.fn();
    const failedWatcher = jest.fn();
    const callback = jest.fn().mockResolvedValueOnce(1);

    const $number = createStore(0);
    const effect = createEffect<number, number>(callback);
    effect.done.watch(doneWatcher);
    effect.failed.watch(failedWatcher);

    const derived = attach(effect, $number);

    await wait(() => derived());

    expect(doneWatcher).toHaveBeenCalledTimes(1);
    expect(doneWatcher).toHaveBeenCalledWith(1);

    const error = new Error();
    callback.mockRejectedValueOnce(error);

    await wait(() => derived());

    expect(failedWatcher).toHaveBeenCalledTimes(1);
    expect(failedWatcher).toHaveBeenCalledWith(error);
  });
});
