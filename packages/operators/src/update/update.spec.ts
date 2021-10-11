import { createEvent, createStore } from '@cometa/core';
import { update } from './update';

describe('update', () => {
  describe('event -> store', () => {
    it('updates', () => {
      const event = createEvent<number>();
      const $store = createStore(0);

      update(event, $store);
      event(1);

      expect($store.value()).toBe(1);
    });

    it('updates reduced', () => {
      const event = createEvent<string>();
      const $store = createStore(0);

      update(
        event,
        $store,
        (current, payload) => current + Number.parseInt(payload, 10),
      );
      event('1');

      expect($store.value()).toBe(1);
    });
  });

  describe('event -> store[]', () => {
    it('updates', () => {
      const event = createEvent<number>();
      const $first = createStore(0);
      const $second = createStore(0);

      update(event, [$first, $second]);
      event(1);

      expect($first.value()).toBe(1);
      expect($second.value()).toBe(1);
    });

    it('updates reduced', () => {
      const event = createEvent<string>();
      const $first = createStore(0);
      const $second = createStore(0);

      update(
        event,
        [$first, $second],
        (current, payload) => current + Number.parseInt(payload, 10),
      );
      event('1');

      expect($first.value()).toBe(1);
      expect($second.value()).toBe(1);
    });
  });
});
