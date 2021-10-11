import { createStore } from '@cometa/core';
import { createShapeUnwrapper } from './shape';

describe('shape', () => {
  describe('createShapeUnwrapper', () => {
    it('creates', () => {
      const shape = {
        value: 1,
        store: createStore('s'),
      };

      const unwrapper = createShapeUnwrapper(shape);

      expect(unwrapper()).toStrictEqual({
        value: 1,
        store: 's',
      });
    });
  });
});
