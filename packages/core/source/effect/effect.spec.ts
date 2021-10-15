import { createEffect } from './effect';

const setup = () => {
  const handlerMock = jest.fn();
  const runWatcherMock = jest.fn();
  const settledWatcherMock = jest.fn();
  const fulfilledWatcherMock = jest.fn();
  const rejectedWatcherMock = jest.fn();
  const doneWatcherMock = jest.fn();
  const failedWatcherMock = jest.fn();

  const effect = createEffect<number, unknown>(handlerMock);

  effect.watch(runWatcherMock);
  effect.settled.watch(settledWatcherMock);
  effect.fulfilled.watch(fulfilledWatcherMock);
  effect.rejected.watch(rejectedWatcherMock);
  effect.done.watch(doneWatcherMock);
  effect.failed.watch(failedWatcherMock);

  return {
    effect,
    handlerMock,
    runWatcherMock,
    settledWatcherMock,
    fulfilledWatcherMock,
    rejectedWatcherMock,
    doneWatcherMock,
    failedWatcherMock,
  };
};

describe('effect', () => {
  it('triggers', () => {
    const { effect, handlerMock, runWatcherMock } = setup();
    const payload = 1;

    effect(payload);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(payload);
    expect(runWatcherMock).toHaveBeenCalledTimes(1);
    expect(runWatcherMock).toHaveBeenCalledWith(payload);
  });

  it('resolves', async () => {
    expect.hasAssertions();

    const {
      effect,
      handlerMock,
      settledWatcherMock,
      fulfilledWatcherMock,
      doneWatcherMock,
    } = setup();

    const payload = 1;
    const result = 2;
    handlerMock.mockResolvedValue(result);

    await expect(effect(payload)).resolves.toBe(result);

    expect(settledWatcherMock).toHaveBeenCalledTimes(1);
    expect(settledWatcherMock.mock.calls[0][0]).toStrictEqual({
      status: 'fulfilled',
      payload,
      result,
    });

    expect(fulfilledWatcherMock).toHaveBeenCalledTimes(1);
    expect(fulfilledWatcherMock.mock.calls[0][0]).toStrictEqual({
      payload,
      result,
    });

    expect(doneWatcherMock).toHaveBeenCalledTimes(1);
    expect(doneWatcherMock).toHaveBeenCalledWith(result);
  });

  it('rejects', async () => {
    expect.hasAssertions();

    const {
      effect,
      handlerMock,
      settledWatcherMock,
      rejectedWatcherMock,
      failedWatcherMock,
    } = setup();

    const payload = 1;
    const error = new Error();
    handlerMock.mockRejectedValue(error);

    await expect(effect(payload)).rejects.toBe(error);

    expect(settledWatcherMock).toHaveBeenCalledTimes(1);
    expect(settledWatcherMock.mock.calls[0][0]).toStrictEqual({
      status: 'rejected',
      payload,
      error,
    });

    expect(rejectedWatcherMock).toHaveBeenCalledTimes(1);
    expect(rejectedWatcherMock.mock.calls[0][0]).toStrictEqual({
      payload,
      error,
    });

    expect(failedWatcherMock).toHaveBeenCalledTimes(1);
    expect(failedWatcherMock).toHaveBeenCalledWith(error);
  });
});
