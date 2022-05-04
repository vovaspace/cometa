import { Flow } from '@cometa/core';
import { useEffect, useState } from 'react';

export const useValue = <T>(source: Flow<T>): T => {
  const [value, setValue] = useState(source.value);

  useEffect(() => source.watch(setValue), [source]);

  return value;
};
