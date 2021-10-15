import { AnyStore } from '../store';
import { watchQueueMessage, watchStoreCreated } from '../lifecycle';

let stores: AnyStore[] = [];
watchStoreCreated((store) => stores.push(store));

export type WaitState = Record<number, unknown>;

export interface WaitResult {
  state: WaitState;
  errors: unknown[];
}

export const wait = async (callback: () => void): Promise<WaitResult> =>
  new Promise((resolve) => {
    let inFlight = 0;
    const state: WaitState = {};
    const errors: unknown[] = [];

    const unwatchers = stores.map((store, index) =>
      store.watch((value) => (state[index] = value)),
    );

    const exit = () => {
      if ((inFlight -= 1) > 0) return;

      resolve({ state, errors });

      stores = [];
      unwatchers.forEach((unwatcher) => unwatcher());
      unwatchQueueMessage();
    };

    const timer = setImmediate(exit);
    const unwatchQueueMessage = watchQueueMessage(async (message) => {
      inFlight += 1;
      clearImmediate(timer);
      try {
        await message;
      } catch (error) {
        errors.push(error);
      } finally {
        exit();
      }
    });

    callback();
  });
