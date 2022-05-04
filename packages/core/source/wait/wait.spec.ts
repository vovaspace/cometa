import { createEffect } from '../effect';
import { createEvent } from '../event';
import { createStore } from '../store';
import { bind } from '../queue';
import { wait } from './wait';

const delay = <T>(
  callback: () => T,
  timeout: number,
  shouldResolve: boolean = true,
): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(async () => {
      const result = await callback();
      if (shouldResolve) resolve(result);
      else reject(result);
    }, timeout);
  });

describe('wait', () => {
  it('wait for all settled', async () => {
    expect.hasAssertions();

    const storeWatcher = jest.fn();
    const $store = createStore(0);
    $store.watch(storeWatcher);

    const setEffect = createEffect<number, number>((payload) =>
      delay(() => payload, 100),
    );
    setEffect.done.watch($store.set);

    const $proxyStore = createStore(0);
    $proxyStore.watch(setEffect);

    const setProxyEffect = createEffect<number>((payload) =>
      delay(() => $proxyStore.set(payload), 100),
    );
    const setProxy = createEvent<number>();
    setProxy.watch(setProxyEffect);

    const triggerEffect = createEffect<void>(() =>
      delay(async () => {
        await setProxyEffect(3);
        setProxy(4);
      }, 200),
    );
    triggerEffect.done.watch(() => setProxy(5));

    const rootEffect = createEffect<void, void>(() => {
      setProxyEffect(1);
      triggerEffect();
      setProxyEffect(2);
    });

    const run = createEvent<void>();
    run.watch(() => rootEffect());

    await wait(() => run());

    expect($store.value()).toBe(5);
    expect($proxyStore.value()).toBe(5);

    expect(storeWatcher).toHaveBeenCalledTimes(5);
    expect(storeWatcher).toHaveBeenNthCalledWith(1, 1);
    expect(storeWatcher).toHaveBeenNthCalledWith(2, 2);
    expect(storeWatcher).toHaveBeenNthCalledWith(3, 3);
    expect(storeWatcher).toHaveBeenNthCalledWith(4, 4);
    expect(storeWatcher).toHaveBeenNthCalledWith(5, 5);
  });

  it('catches errors', async () => {
    expect.hasAssertions();

    const error1 = new Error('ERROR_1');
    const handlingEffect = createEffect(() => delay(() => error1, 50, false));

    const error2 = new Error('ERROR_2');
    const failingEffect = createEffect<void, void>(
      jest.fn().mockRejectedValue(error2),
    );
    failingEffect.failed.watch(() => {
      handlingEffect();
    });

    const delayedEffect = createEffect<number>((payload) => {
      const bound = bind(failingEffect);
      return delay(() => {
        bound();
      }, payload);
    });

    const run = createEvent<void>();
    run.watch(() => {
      delayedEffect(100);
      delayedEffect(200);
    });

    await expect(wait(() => run())).resolves.toStrictEqual({
      errors: [error2, error1, error2, error1],
    });
  });
});
