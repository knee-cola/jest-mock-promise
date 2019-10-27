import JestMockPromise from "../lib/jest-mock-promise";

test('`finally` must be called with no arguments after if a promise is resolved', () => {
    let promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise.then(thenHandler);
    promise.finally(finallyHandler);

    promise.resolve('some data');

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([["some data"]]);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
});

test('`finally` must be called after if a promise is rejected', () => {
    let promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const catchHandler = jest.fn();

    promise.catch(catchHandler);
    promise.finally(finallyHandler);
    promise.reject('some error data');

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([['some error data']]);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
});

test('if promise is RESOLVED `then` directly following after `finally` should also be called', () => {
    let promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise.finally(finallyHandler);
    promise.then(thenHandler);

    promise.resolve('some data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([[void 0]]);
});

test('if promise is REJECTED `then` directly following after `finally` should also be called', () => {
    let promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise.finally(finallyHandler);
    promise.then(thenHandler);

    promise.reject('error data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([[void 0]]);
});

test('if an error is thrown inside `finally` the closest `catch` should be called', () => {
    let promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const catchHandler = jest.fn();
    const mockError = new Error('mock error');

    promise.finally(() => {
        finallyHandler();
        throw mockError;
    });

    promise.then(() => {});
    promise.catch(catchHandler);

    promise.resolve('some data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([[mockError]]);
});

test('if an error is thrown inside `finally` all the `finally` which follow should also be called', () => {
    let promise = new JestMockPromise();

    const finallyHandler1= jest.fn();
    const finallyHandler2 = jest.fn();

    promise.finally(() => {
        finallyHandler1();
        throw new Error('mock error');
    });

    promise.finally(finallyHandler2);

    promise.resolve('some data');

    expect(finallyHandler1.mock.calls.length).toEqual(1);
    expect(finallyHandler1.mock.calls).toEqual([[]]);

    expect(finallyHandler2.mock.calls.length).toEqual(1);
    expect(finallyHandler2.mock.calls).toEqual([[]]);

});
