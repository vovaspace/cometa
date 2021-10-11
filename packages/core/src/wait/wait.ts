import { watchQueueMessage } from '../lifecycle';

export const wait = async (callback: () => void): Promise<unknown[]> =>
  new Promise((resolve) => {
    let inFlight = 0;
    const errors: unknown[] = [];

    const exit = () => {
      if ((inFlight -= 1) > 0) return;

      resolve(errors);
      unwatch();
    };

    const unwatch = watchQueueMessage(async (message) => {
      inFlight += 1;
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
