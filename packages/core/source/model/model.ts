import { createExoticExecutableEvent, Event, AnyEvent } from '../event';
import { context } from '../context';
import { createHost } from '../host';
import { Scope, ScopeKey } from '../scope';
import { AnyStore } from '../store';
import { lifecycle } from '../lifecycle';

export const ModelControllerSymbol = Symbol('Model/Controller');

export type ExoticModelScopedEvent = Event<ScopeKey>;

export interface ModelController {
  clear: () => void;
  scope: Scope | null;
  scoped: ExoticModelScopedEvent;
}

export interface ModelInternals {
  [ModelControllerSymbol]: ModelController;
}

export type Model<M> = M & ModelInternals;
export type AnyModel = Model<any>;

export type ModelFactory<M, A extends unknown[]> = (...args: A) => Model<M>;

export const createModel = <M>(
  creator: (controller: ModelController) => M,
): Model<M> => {
  const host = createHost().enter();

  let units: (AnyStore | AnyEvent)[] | null = [];
  const unwatchers = [
    lifecycle.store.created.watch((store) => units!.push(store)),
    lifecycle.event.created.watch((event) => units!.push(event)),
  ];

  let ready = false;
  let scoping: ScopeKey | null = null;

  const scoped = (key: ScopeKey) =>
    units !== null &&
    controller.scope &&
    (controller.scope.register(key, units), (units = null));

  const controller: ModelController = {
    clear: host.clear,
    scope: context.scope,
    scoped: createExoticExecutableEvent<ScopeKey, void>((payload) =>
      ready ? scoped(payload) : (scoping = payload),
    ),
  };

  const instance = creator(controller) as Model<M>;
  instance[ModelControllerSymbol] = controller;

  ready = true;

  if (scoping !== null) scoped(scoping!);

  unwatchers.forEach((unwatch) => unwatch());
  host.exit();

  return instance;
};

export const model = createModel;
