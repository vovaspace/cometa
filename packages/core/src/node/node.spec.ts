import { context } from '../context';
import { createNode } from './node';

describe('node', () => {
  beforeAll(() => {
    context.current = null;
  });

  afterEach(() => {
    context.current = null;
  });

  it('sets context', () => {
    const node = createNode();
    expect(context.current).toBe(node);
  });

  it('sets previous context', () => {
    const first = createNode();
    expect(context.current).toBe(first);

    const second = createNode();
    expect(context.current).toBe(second);

    second.done();
    expect(context.current).toBe(first);

    first.done();
    expect(context.current).toBeNull();
  });

  it('watches', () => {
    const node = createNode();
    const watcher = jest.fn();
    node.watch(watcher);

    node.emit(null);

    expect(watcher).toHaveBeenCalledWith(null);
  });

  it('clears children', () => {
    const first = createNode();
    const second = createNode();

    second.done();
    first.done();

    const watcher = jest.fn();
    second.watch(watcher);
    first.clear();
    second.emit(null);

    expect(watcher).not.toHaveBeenCalled();
  });

  it('depends a current node', () => {
    const first = createNode();
    const second = createNode();

    const watcher = jest.fn();
    first.watch(watcher);

    second.done();
    first.done();

    second.clear();
    first.emit(null);

    expect(watcher).not.toHaveBeenCalled();
  });
});
