import { createStore } from '@cometa/core';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-test-renderer';
import { useValue } from './use-value';

describe('use-value', () => {
  it('uses store value', () => {
    const $store = createStore(0);

    const { result } = renderHook(() => useValue($store));

    expect(result.current).toBe(0);

    act(() => {
      $store.set(1);
    });

    expect(result.current).toBe(1);
  });
});
