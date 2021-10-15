import { defineModel } from '../model';
import { createStore } from '../store';
import { rollback } from './rollback';

describe('rollback', () => {
  it('resets all stores', () => {
    const $fisrt = createStore(1);
    const $second = createStore(2);

    $fisrt.set(2);
    $second.set(3);

    rollback();

    expect($fisrt.value()).toBe(1);
    expect($second.value()).toBe(2);
  });

  it('clears all models', () => {
    const Some = defineModel((key: number) => ({ key }));
    const instance = Some(0);

    rollback();

    expect(Some(0)).not.toBe(instance);
  });
});
