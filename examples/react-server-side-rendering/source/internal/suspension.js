import { wait } from '@cometa/core';
import { useRef } from 'react';

const compare = (a, b) => {
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
};

export const useSuspension =
  typeof window === 'undefined'
    ? (event, payload = null, dependencies = []) => {
        const { suspension } = event.meta;
        let current;

        if (suspension === undefined) {
          current = { dependencies, done: false, promise: null };
          event.meta.suspension = [current];
        } else {
          current = suspension.find((s) =>
            compare(s.dependencies, dependencies),
          );

          if (current === undefined) {
            current = { dependencies, done: false, promise: null };
            event.meta.suspension.push(current);
          }
        }

        if (current.done) return;
        if (current.promise) throw current.promise;

        current.promise = wait(() => event(payload)).then(() => {
          current.done = true;
          current.promise = null;
        });

        throw current.promise;
      }
    : (event, payload = null, dependencies = []) => {
        const done = useRef(false);
        if (done.current) return;

        const { suspension } = event.meta;
        let current;

        if (suspension === undefined) {
          current = { dependencies, done: false };
          event.meta.suspension = [current];
        } else {
          current = suspension.find((s) =>
            compare(s.dependencies, dependencies),
          );

          if (current === undefined) {
            current = { dependencies, done: false };
            event.meta.suspension.push(current);
          }
        }

        if (current.done) return;

        event(payload);
        current.done = true;
        done.current = true;
      };
