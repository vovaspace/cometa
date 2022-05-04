import { createNode } from './node';

describe('node', () => {
  it('watches', () => {
    const node = createNode();
    const watcher = jest.fn();
    node.watch(watcher);

    node.emit(null);

    expect(watcher).toHaveBeenCalledWith(null);
  });
});
