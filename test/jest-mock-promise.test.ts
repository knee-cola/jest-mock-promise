import JestMockPromise from "../lib/jest-mock-promise";

test('`finally` must be called with no arguments after if a promise is resolved', () => {
    const promise = new JestMockPromise<[number, number]>();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn<void, [[number, number]]>();

    promise.then(thenHandler);
    promise.catch(() => {});
    promise.finally(finallyHandler);

    promise.resolve([1, 2]);

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([[[1, 2]]]);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
});

test('`finally` must be called after if a promise is rejected', () => {
    const promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const catchHandler = jest.fn();

    promise.then(() => {});
    promise.catch(catchHandler);
    promise.finally(finallyHandler);
    promise.reject('some error data');

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([['some error data']]);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
});

test('if promise is RESOLVED `then` directly following after `finally` should also be called', () => {
    const promise = new JestMockPromise<string>();

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
    const promise = new JestMockPromise();

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
    const promise = new JestMockPromise();

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
    const promise = new JestMockPromise();

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

test('if an error is thrown inside `this` the closest `catch` should be called', () => {
    const promise = new JestMockPromise<string>();

    const thenHandler = jest.fn();
    const catchHandler = jest.fn();
    const mockError = new Error('mock error');

    promise.finally(() => {
        thenHandler();
        throw mockError;
    });

    promise.then(() => {});
    promise.catch(catchHandler);

    promise.resolve('some data');

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([[]]);

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([[mockError]]);
});
test('if an error is thrown inside `this` the closest `catch` should be called', () => {
    const promise = new JestMockPromise<string>();

    const catchHandler = jest.fn();
    const mockError = new Error('mock error');

    promise.then(() => {
        throw mockError;
    });

    promise.then(() => {});
    promise.catch(catchHandler);

    promise.resolve('some data');

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([[mockError]]);
});

test('if an error is thrown inside `catch` the closest `catch` should be called', () => {
    const promise = new JestMockPromise();

    const catchHandler2 = jest.fn();
    const mockError = new Error('mock error');

    promise.catch(() => {
        throw mockError;
    });

    promise.then(() => {});
    promise.catch(catchHandler2);

    promise.reject('error data');

    expect(catchHandler2.mock.calls.length).toEqual(1);
    expect(catchHandler2.mock.calls).toEqual([[mockError]]);
});

test('if promise is pre-resolved `then` and `finally` must be called as soon as they are registered', () => {
    const promise = new JestMockPromise();
    
    promise.resolve('mock data');

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise.finally(finallyHandler);
    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    promise.then(thenHandler);
    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([['mock data']]);
});

test('if promise is pre-rejected `catch` and `finally` must be called as soon as they are registered', () => {
    const promise = new JestMockPromise();
    
    promise.reject('error data');

    const finallyHandler = jest.fn();
    const catchHandler = jest.fn();

    promise.finally(finallyHandler);
    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    promise.catch(catchHandler);
    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([['error data']]);
});

test('return value from one `then` should be passed to the next one in chain', () => {
    const promise = new JestMockPromise<string>();
    
    const thenHandler2 = jest.fn();

    promise.then(() => 'returned by first handler');
    promise.then(thenHandler2);

    promise.resolve('initial data');

    expect(thenHandler2.mock.calls.length).toEqual(1);
    expect(thenHandler2.mock.calls).toEqual([['returned by first handler']]);
});

test('return value from `catch` should be passed to the next `then` in chain', () => {
    const promise = new JestMockPromise();
    
    const thenHandler2 = jest.fn();

    promise.catch(() => 'returned by catch handler');
    promise.then(thenHandler2);

    promise.reject('error data');

    expect(thenHandler2.mock.calls.length).toEqual(1);
    expect(thenHandler2.mock.calls).toEqual([['returned by catch handler']]);
});

test('if promise is pre-resolved and `then` is called with a non-function as onFulfilled callback, onFulfilled should be replaced by identity function', () => {
    const promise = new JestMockPromise<string>();
  
    promise.resolve('mock data');
  
    const thenHandler = jest.fn();
    promise.then(null).then(thenHandler);
  
    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([['mock data']]);
  });
  
test('if `then` is called with a non-function as onFulfilled callback, onFulfilled should be replaced by identity function', () => {
    const promise = new JestMockPromise<string>();

    const thenHandler = jest.fn();
    promise.then(null).then(thenHandler);

    promise.resolve('mock data');

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([['mock data']]);
});

test('in case of multiple `then` handlers each must be called with the value returned by the previous one', () => {
    const promise = new JestMockPromise<string>();

    const firstHandler = jest.fn<any,[string]>().mockReturnValue("1st return value");
    const secondHandler = jest.fn().mockReturnValue("2nd return value");
    const thirdHandler = jest.fn();

    promise
        .then(firstHandler)
        .then(secondHandler)
        .then(thirdHandler);

    promise.resolve('mock data');

    expect(firstHandler.mock.calls.length).toEqual(1);
    expect(firstHandler.mock.calls).toEqual([['mock data']]);

    expect(secondHandler.mock.calls.length).toEqual(1);
    expect(secondHandler.mock.calls).toEqual([['1st return value']]);

    expect(thirdHandler.mock.calls.length).toEqual(1);
    expect(thirdHandler.mock.calls).toEqual([['2nd return value']]);
});

test('if promise is pre-resolved and and there are multiple `then` handlers each must be called with the value returned by the previous one', () => {
    const promise = new JestMockPromise<string>();

    const firstHandler = jest.fn<any,[string]>().mockReturnValue("1st return value");
    const secondHandler = jest.fn().mockReturnValue("2nd return value");
    const thirdHandler = jest.fn();

    promise.resolve('mock data');

    promise
        .then(firstHandler)
        .then(secondHandler)
        .then(thirdHandler);


    expect(firstHandler.mock.calls.length).toEqual(1);
    expect(firstHandler.mock.calls).toEqual([['mock data']]);

    expect(secondHandler.mock.calls.length).toEqual(1);
    expect(secondHandler.mock.calls).toEqual([['1st return value']]);

    expect(thirdHandler.mock.calls.length).toEqual(1);
    expect(thirdHandler.mock.calls).toEqual([['2nd return value']]);
});