export interface Unit<T> {
  watch: (watcher: (update: T) => void) => () => void;
}

export type UnitType<U> = U extends Unit<infer T> ? T : never;
export type AnyUnit = Unit<any>;
