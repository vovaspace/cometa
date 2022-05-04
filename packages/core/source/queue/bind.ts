import { context } from '../context';
import { createExoticExecutableEvent, Event } from '../event';

export const bind = <Payload>(event: Event<Payload>): Event<Payload> => {
  const { queue } = context;
  return createExoticExecutableEvent<Payload, void>(
    (payload) => ((context.queue = queue), event(payload)),
  );
};
