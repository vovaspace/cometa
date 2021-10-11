import type { Node } from '../node';

export interface Context {
  current: Node | null;
}

export const context: Context = {
  current: null,
};
