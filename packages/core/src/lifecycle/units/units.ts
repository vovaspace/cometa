import type { AnyUnit } from '../../unit';
import { createWatcher } from '../../watcher';

export const { watch: watchUnitCreated, emit: emitUnitCreated } =
  createWatcher<AnyUnit>();
