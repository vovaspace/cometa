import { createStore } from '../store';
import { ModelControllerSymbol, createModel } from './model';

describe('model', () => {
  it('creates', () => {
    const model = createModel(() => ({
      $number: createStore(0),
    }));

    expect(model.$number.value()).toBe(0);
  });

  it('unwatches external watchers on cleared', () => {
    const watcher = jest.fn();
    const $external = createStore(0);

    const model = createModel(() => {
      $external.watch(watcher);
      return {};
    });

    $external.set(1);
    model[ModelControllerSymbol].clear();
    $external.set(2);

    expect(watcher).toHaveBeenCalledTimes(1);
    expect(watcher).toHaveBeenCalledWith(1);
  });
});
