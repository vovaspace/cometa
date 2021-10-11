import { watchModelCreated, watchStoreCreated } from '../lifecycle';
import { UnknownModel } from '../model';
import { AnyWritableStore } from '../store';

const stores = new Set<AnyWritableStore>();
const models = new Set<UnknownModel>();

watchStoreCreated((store) => stores.add(store));
watchModelCreated((model) => models.add(model));

export const rollback = () => {
  if (process.env.NODE_ENV === 'production')
    console.error(
      '`rollback()` should be used only during development or tests.',
    );

  stores.forEach((store) => store.reset());
  models.forEach((model) => model.clear());
};
