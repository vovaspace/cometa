import {
  createEffect,
  createEvent,
  createFlow,
  createStore,
  wait,
} from '@cometa/core';
import { attach } from './attach';

const setup = <T>() => {
  const watcher = jest.fn();
  const event = createEvent<T>();
  event.watch(watcher);
  return [event, watcher] as const;
};

describe('attach', () => {
  describe('store source', () => {
    it('attaches full-payload source', () => {
      const [event, watcher] = setup<number>();
      const $number = createFlow(() => 0);

      const derived = attach(event, $number);

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(0);
    });

    it('attaches full-payload source with map', () => {
      const [event, watcher] = setup<number>();
      const $number = createStore(0);

      const derived = attach(event, $number, (source) => source + 1);

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(1);
    });

    it('attaches full-payload source with map and payload', () => {
      const [event, watcher] = setup<number>();
      const $number = createStore(0);

      const derived = attach(
        event,
        $number,
        (source, payload: number) => source + payload,
      );

      derived(2);

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(2);
    });

    it('attaches raw source with map', () => {
      const [event, watcher] = setup<number>();
      const $string = createFlow(() => '1');

      const derived = attach(event, $string, (source) =>
        Number.parseInt(source, 10),
      );

      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(1);
    });

    it('attaches raw source with map and payload', () => {
      const [event, watcher] = setup<number>();
      const $string = createStore('1');

      const derived = attach(
        event,
        $string,
        (source, payload: number) => Number.parseInt(source, 10) + payload,
      );

      derived(2);

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith(3);
    });
  });

  describe('state shape source', () => {
    it('attaches full-payload object source', () => {
      const [event, watcher] =
        setup<{ num: number; str: string; bool: boolean }>();

      const derived = attach(event, {
        num: createStore(0),
        str: createFlow(() => 'str'),
        bool: true,
      });
      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith({ num: 0, str: 'str', bool: true });
    });

    it('attaches full-payload array source', () => {
      const [event, watcher] = setup<[number, string, boolean]>();

      const derived = attach(event, [
        createStore(0),
        createFlow(() => 'str'),
        true,
      ]);
      derived();

      expect(watcher).toHaveBeenCalledTimes(1);
      expect(watcher).toHaveBeenCalledWith([0, 'str', true]);
    });
  });

  it('attaches effect', async () => {
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
