import { watchStoreCreated } from '../lifecycle';
import { AnyStore } from '../store';
import { WaitState } from '../wait';

let stores: AnyStore[] = [];
const unwatchGlobal = watchStoreCreated((store) => stores.push(store));

export const hydrate = (state: WaitState) => {
  unwatchGlobal();

  const last = Object.keys(state).length;
  let done = 0;
  let current = -1;

  const set = (store: AnyStore) => {
    if (Object.prototype.hasOwnProperty.call(state, (current += 1))) {
      store.set(state[current]);
      done += 1;
    }
  };

  stores.forEach(set);
  stores = [];

  if (done < last) {
    const unwatchLocal = watchStoreCreated((store) => {
      set(store);
      if (done === last) unwatchLocal();
    });
  }
};
