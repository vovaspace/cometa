import { createStore } from './store';

describe('store', () => {
  it('keeps state', () => {
    const $store = createStore(0);
    expect($store.value()).toBe(0);

    $store(1);
    expect($store.value()).toBe(1);

    $store.set(2);
    expect($store.value()).toBe(2);
  });

  it('resets', () => {
    const $store = createStore(0);
    $store.set(1);

    $store.reset();

    expect($store.value()).toBe(0);
  });

  it('watches', () => {
    const watcher = jest.fn();
    const $store = createStore(0);
    const unwatch = $store.watch(watcher);

    $store.set(1);

    unwatch();

    $store.set(2);

    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenCalledWith(1);
  });

  it('subscribes', () => {
    const listener = jest.fn();
    const $store = createStore(0);
    const unsubscribe = $store.subscribe(listener);

    $store.set(1);

    unsubscribe();

    $store.set(2);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, 0);
    expect(listener).toHaveBeenNthCalledWith(2, 1);
  });
});
