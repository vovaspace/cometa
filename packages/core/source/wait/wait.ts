import { context } from '../context';
import { createQueue } from '../queue';

export interface WaitResult {
  errors: unknown[];
}

export const wait = async (callback: () => void): Promise<WaitResult> =>
  new Promise((resolve) => {
    const queue = createQueue();
    let inFlight = 0;
    const errors: unknown[] = [];

    const exit = () => {
      if ((inFlight -= 1) > 0) return;

      resolve({ errors });

      context.queue = null;
      unwatch();
    };

    const timer = setImmediate(exit);
    const unwatch = queue.watch(async (message) => {
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

    context.queue = queue;
    callback();
    context.queue = null;
  });
