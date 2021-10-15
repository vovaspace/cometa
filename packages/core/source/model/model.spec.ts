import { createStore } from '../store';
import { defineModel } from './model';

describe('model', () => {
  it('defines and creates', () => {
    const Some = defineModel((key: string) => ({
      key,
      $number: createStore(0),
    }));

    const instance = Some('key1');

    expect(instance.key).toBe('key1');
    expect(instance.$number.value()).toBe(0);
  });

  it('caches instances', () => {
    const Some = defineModel((key: string) => ({
      key,
    }));

    expect(Some('key1')).toBe(Some('key1'));
  });

  it('removes instance from cache on clear', () => {
    const Some = defineModel((key: string) => ({
      key,
    }));

    const instance = Some('key1');
    instance.clear();

    expect(Some('key1')).not.toBe(instance);
  });

  it('unwatches external watchers on clear', () => {
    const listener = jest.fn();
    const $store = createStore(0);

    const Some = defineModel((key: string) => {
      $store.watch(listener);

      return {
        key,
      };
    });

    const instance = Some('key1');

    instance.clear();
    $store.set(1);

    expect(listener).not.toHaveBeenCalled();
  });
});
