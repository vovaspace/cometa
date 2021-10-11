import { emitModelCreated } from '../lifecycle';
import { Node, createNode } from '../node';

export type ModelKey = string | number | symbol;

export type Model<M> = M & Pick<Node, 'clear'>;
export type UnknownModel = Model<unknown>;

export type ModelFactory<M, Key extends ModelKey> = (key: Key) => Model<M>;

export const defineModel = <M, Key extends ModelKey>(
  creator: (key: Key) => M,
): ModelFactory<M, Key> => {
  const instances = new Map<Key, Model<M>>();

  return (key: Key): Model<M> => {
    const cache = instances.get(key);
    if (cache !== undefined) return cache;

    const { clear, done } = createNode();

    const instance = creator(key) as Model<M>;

    instance.clear = () => {
      clear();
      instances.delete(key);
    };

    done();
    instances.set(key, instance);

    return emitModelCreated(instance);
  };
};

export const model = defineModel;
