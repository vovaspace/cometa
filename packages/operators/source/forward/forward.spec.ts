import { createEffect, createEvent, createStore } from '@cometa/core';
import { forward } from './forward';

describe('forward', () => {
  describe('store -> store', () => {
    it('forwards', () => {
      const $from = createStore(1);
      const $to = createStore(0);

      forward($from, $to);
      expect($to.value()).toBe(0);

      $from.set(2);
      expect($to.value()).toBe(2);
    });

    it('forwards mapped', () => {
      const $number = createStore(1);
      const $otherNumber = createStore(0);
      const $boolean = createStore(false);

      forward($number, $otherNumber, (num) => num + 1);
      forward($number, $boolean, Boolean);

      expect($otherNumber.value()).toBe(0);
      expect($boolean.value()).toBe(false);

      $number.set(2);

      expect($otherNumber.value()).toBe(3);
      expect($boolean.value()).toBe(true);
    });
  });

  describe('store -> event', () => {
    it('forwards', () => {
      const eventWatcher = jest.fn();
      const $store = createStore(0);
      const event = createEvent<number>();
      event.watch(eventWatcher);

      forward($store, event);
      $store.set(1);

      expect(eventWatcher).toHaveBeenCalledTimes(1);
      expect(eventWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const eventWatcher = jest.fn();
      const $store = createStore(0);
      const event = createEvent<boolean>();
      event.watch(eventWatcher);

      forward($store, event, Boolean);
      $store.set(1);

      expect(eventWatcher).toHaveBeenCalledTimes(1);
      expect(eventWatcher).toHaveBeenCalledWith(true);
    });
  });

  describe('store -> effect', () => {
    it('forwards', () => {
      const effectRunWatcher = jest.fn();
      const $store = createStore(0);
      const effect = createEffect<number, void>(() => {});
      effect.watch(effectRunWatcher);

      forward($store, effect);
      $store.set(1);

      expect(effectRunWatcher).toHaveBeenCalledTimes(1);
      expect(effectRunWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const effectRunWatcher = jest.fn();
      const $store = createStore(0);
      const effect = createEffect<boolean, void>(() => {});
      effect.watch(effectRunWatcher);

      forward($store, effect, Boolean);
      $store.set(1);

      expect(effectRunWatcher).toHaveBeenCalledTimes(1);
      expect(effectRunWatcher).toHaveBeenCalledWith(true);
    });
  });

  describe('event -> event', () => {
    it('forwards', () => {
      const toWatcher = jest.fn();
      const from = createEvent<number>();
      const to = createEvent<number>();
      to.watch(toWatcher);

      forward(from, to);
      from(1);

      expect(toWatcher).toHaveBeenCalledTimes(1);
      expect(toWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const toWatcher = jest.fn();
      const from = createEvent<number>();
      const to = createEvent<boolean>();
      to.watch(toWatcher);

      forward(from, to, Boolean);
      from(1);

      expect(toWatcher).toHaveBeenCalledTimes(1);
      expect(toWatcher).toHaveBeenCalledWith(true);
    });
  });

  describe('event -> store', () => {
    it('forwards', () => {
      const event = createEvent<number>();
      const $store = createStore(0);

      forward(event, $store);
      event(1);

      expect($store.value()).toBe(1);
    });

    it('forwards mapped', () => {
      const event = createEvent<number>();
      const $store = createStore(false);

      forward(event, $store, Boolean);
      event(1);

      expect($store.value()).toBe(true);
    });
  });

  describe('event -> effect', () => {
    it('forwards', () => {
      const effectRunWatcher = jest.fn();
      const event = createEvent<number>();
      const effect = createEffect<number, void>(() => {});
      effect.watch(effectRunWatcher);

      forward(event, effect);
      event(1);

      expect(effectRunWatcher).toHaveBeenCalledTimes(1);
      expect(effectRunWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const effectRunWatcher = jest.fn();
      const event = createEvent<number>();
      const effect = createEffect<boolean, void>(() => {});
      effect.watch(effectRunWatcher);

      forward(event, effect, Boolean);
      event(1);

      expect(effectRunWatcher).toHaveBeenCalledTimes(1);
      expect(effectRunWatcher).toHaveBeenCalledWith(true);
    });
  });

  describe('effect -> effect', () => {
    it('forwards', () => {
      const toRunWatcher = jest.fn();
      const from = createEffect<number, void>(() => {});
      const to = createEffect<number, void>(() => {});
      to.watch(toRunWatcher);

      forward(from, to);
      from(1);

      expect(toRunWatcher).toHaveBeenCalledTimes(1);
      expect(toRunWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const toRunWatcher = jest.fn();
      const from = createEffect<number, void>(() => {});
      const to = createEffect<boolean, void>(() => {});
      to.watch(toRunWatcher);

      forward(from, to, Boolean);
      from(1);

      expect(toRunWatcher).toHaveBeenCalledTimes(1);
      expect(toRunWatcher).toHaveBeenCalledWith(true);
    });
  });

  describe('effect -> store', () => {
    it('forwards', () => {
      const effect = createEffect<number, void>(() => {});
      const $store = createStore(0);

      forward(effect, $store);
      effect(1);

      expect($store.value()).toBe(1);
    });

    it('forwards mapped', () => {
      const effect = createEffect<number, void>(() => {});
      const $store = createStore(false);

      forward(effect, $store, Boolean);
      effect(1);

      expect($store.value()).toBe(true);
    });
  });

  describe('effect -> event', () => {
    it('forwards', () => {
      const eventWatcher = jest.fn();
      const effect = createEffect<number, void>(() => {});
      const event = createEvent<number>();
      event.watch(eventWatcher);

      forward(effect, event);
      effect(1);

      expect(eventWatcher).toHaveBeenCalledTimes(1);
      expect(eventWatcher).toHaveBeenCalledWith(1);
    });

    it('forwards mapped', () => {
      const eventWatcher = jest.fn();
      const effect = createEffect<number, void>(() => {});
      const event = createEvent<boolean>();
      event.watch(eventWatcher);

      forward(effect, event, Boolean);
      effect(1);

      expect(eventWatcher).toHaveBeenCalledTimes(1);
      expect(eventWatcher).toHaveBeenCalledWith(true);
    });
  });
});
