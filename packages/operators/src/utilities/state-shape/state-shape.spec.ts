import { createFlow, createStore } from '@cometa/core';
import { createStateShapeUnwrapper } from './state-shape';

describe('state-shape', () => {
  describe('createStateShapeUnwrapper', () => {
    it('unwraps object', () => {
      const unwrapper = createStateShapeUnwrapper({
        num: 1,
        flow: createFlow(() => false),
        store: createStore(0),
        1: createStore('str'),
      });

      expect(unwrapper()).toStrictEqual({
        num: 1,
        flow: false,
        store: 0,
        1: 'str',
      });
    });

    it('unwraps array', () => {
      const unwrapper = createStateShapeUnwrapper([
        1,
        createFlow(() => false),
        createStore('str'),
      ]);

      expect(unwrapper()).toStrictEqual([1, false, 'str']);
    });
  });
});
