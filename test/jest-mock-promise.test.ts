import JestMockPromise from "../lib/jest-mock-promise";

test('it should support pre-resolved promise', async () => {
    const handler = jest.fn()

    const promise = JestMockPromise
        .resolve("abcd")
        .then(handler);

    await promise;
    
    expect(handler.mock.calls.length).toEqual(1);
    expect(handler).toHaveBeenCalledWith("abcd");
});

test('it should support pre-rejected promise', async () => {
    const handler = jest.fn()

    const promise = JestMockPromise
        .reject("some error")
        .catch(handler);

    await promise;
    
    expect(handler.mock.calls.length).toEqual(1);
    expect(handler).toHaveBeenCalledWith("some error");
});

test('`finally` must be called with no arguments after if a promise is resolved', () => {

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn<void, [[number, number]]>();

    const promise = new JestMockPromise<[number, number]>();

    promise
        .then(thenHandler)
        .catch(() => {})
        .finally(finallyHandler);

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

    promise.then(() => {})
        .catch(catchHandler)
        .finally(finallyHandler)
    
    promise.reject('some error data');

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([['some error data']]);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
});

test('if promise is RESOLVED then directly following after finally should also be called', () => {
    const promise = new JestMockPromise<string>();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise
        .finally(finallyHandler)
        .then(thenHandler);

    promise.resolve('some data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(thenHandler.mock.calls.length).toEqual(1);
    expect(thenHandler.mock.calls).toEqual([['some data']]);
});

test('if promise is REJECTED then "then" directly following after finally should NOT be called', () => {
    const promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise
        .finally(finallyHandler)
        .then(thenHandler);

    promise.reject('error data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(thenHandler.mock.calls.length).toEqual(0);
});

test('if an error is thrown inside `finally` the closest `catch` should be called', () => {
    const promise = new JestMockPromise();

    const finallyHandler = jest.fn();
    const catchHandler1 = jest.fn();
    const catchHandler2 = jest.fn();

    const mockError = new Error('mock error');

    promise.finally(() => {
            finallyHandler();
            throw mockError;
        })
        .then(() => {})
        .catch(catchHandler1)
        .catch(catchHandler2);

    promise.resolve('some data');

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);

    expect(catchHandler1.mock.calls.length).toEqual(1);
    expect(catchHandler1.mock.calls).toEqual([[mockError]]);

    expect(catchHandler2).not.toBeCalled();
});

test('if an error is thrown inside `finally` all the `finally` which follow should also be called', () => {

    const finallyHandler1= jest.fn();
    const finallyHandler2 = jest.fn();

    const promise = new JestMockPromise();

    promise.finally(() => {
            finallyHandler1();
            throw new Error('mock error');
        })
        .finally(finallyHandler2)

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
        })
        .then(() => {})
        .catch(catchHandler);

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
        })
        .then(() => {})
        .catch(catchHandler);

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
        })
        .then(() => {})
        .catch(catchHandler2);

    promise.reject('error data');

    expect(catchHandler2.mock.calls.length).toEqual(1);
    expect(catchHandler2.mock.calls).toEqual([[mockError]]);
});

test('if promise is pre-resolved then and finally must be called as soon as they are registered', () => {
    const promise = new JestMockPromise();
    
    promise.resolve('mock data');

    const finallyHandler = jest.fn();
    const thenHandler = jest.fn();

    promise
        .finally(finallyHandler)
        .then(thenHandler);

    expect(finallyHandler.mock.calls.length).toEqual(1);
    expect(finallyHandler.mock.calls).toEqual([[]]);
    
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

    promise
        .then(() => 'returned by first handler')
        .then(thenHandler2);

    promise.resolve('initial data');

    expect(thenHandler2.mock.calls.length).toEqual(1);
    expect(thenHandler2.mock.calls).toEqual([['returned by first handler']]);
});

test('return value from `catch` should be ignored (NOT passed to the next `then` in chain)', () => {
    const promise = new JestMockPromise();
    
    const thenHandler2 = jest.fn();

    promise
        .catch(() => 'returned by catch handler')
        .then(thenHandler2);

    promise.reject('error data');

    expect(thenHandler2.mock.calls.length).toEqual(1);
    expect(thenHandler2.mock.calls).toEqual([[undefined]]);
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

test('if multiple handlers have been attached to same promise, all should be resolved', () => {
    const promise = new JestMockPromise<string>();

    const handlerA1 = jest.fn<any,[string]>().mockReturnValue("A1 return value");
    const handlerA2 = jest.fn<any,[string]>().mockReturnValue("A2 return value");

    const handlerB1 = jest.fn().mockReturnValue("B1 return value");
    const handlerB2 = jest.fn().mockReturnValue("B2 return value");

    const handlerC = jest.fn();

    promise.then(handlerA1)
        .then(handlerA2);

    promise
        .then(handlerB1)
        .then(handlerB2);

    promise.then(handlerC);

    promise.resolve('original data');

    expect(handlerA1.mock.calls.length).toEqual(1);
    expect(handlerA1.mock.calls).toEqual([['original data']]);

    expect(handlerA2.mock.calls.length).toEqual(1);
    expect(handlerA2.mock.calls).toEqual([['A1 return value']]);

    expect(handlerB1.mock.calls.length).toEqual(1);
    expect(handlerB1.mock.calls).toEqual([['original data']]);

    expect(handlerB2.mock.calls.length).toEqual(1);
    expect(handlerB2.mock.calls).toEqual([['B1 return value']]);

    expect(handlerC.mock.calls.length).toEqual(1);
    expect(handlerC.mock.calls).toEqual([['original data']]);
});

test('for a pre-resolved promise if THEN handlers throws an error the next promise must be rejected', () => {
    const promise = new JestMockPromise();

    promise.resolve("some value");

    const firstHandler = () => { throw new Error('some error') };
    const secondHandler = jest.fn();
    const rejectionHandler = jest.fn();

    promise
        .then(firstHandler)
        .then(secondHandler)
        .catch(rejectionHandler);


    expect(secondHandler).not.toBeCalled();

    expect(rejectionHandler.mock.calls.length).toEqual(1);
    expect(rejectionHandler.mock.calls).toEqual([[new Error('some error')]]);
});

test('for a pre-rejected promise if CATCH handlers throws an error the next promise must be rejected', () => {
    const promise = new JestMockPromise();

    promise.reject("some error 1");

    const firstHandler = jest.fn();
    const secondHandler = jest.fn();
    const catchHandler = jest.fn();

    promise
        .then(firstHandler)
        .catch(() => { throw new Error('some error 2') })
        .then(secondHandler)
        .catch(catchHandler)


    expect(firstHandler).not.toBeCalled();
    expect(secondHandler).not.toBeCalled();

    expect(catchHandler.mock.calls.length).toEqual(1);
    expect(catchHandler.mock.calls).toEqual([[new Error('some error 2')]]);
});

test('for a pre-resolved promise FINALLY must be called', () => {
    const promise = new JestMockPromise();

    promise.resolve("some value");

    const finalHandler = jest.fn();
    const rejectionHandler = jest.fn();

    promise
        .finally(finalHandler)
        .catch(rejectionHandler);


    expect(finalHandler.mock.calls.length).toEqual(1);
    expect(finalHandler.mock.calls).toEqual([[]]);

    expect(rejectionHandler).not.toBeCalled();
});

test('for a pre-resolved promise if FINALLY throws an error, next promise must be rejected', () => {
    const promise = new JestMockPromise();

    promise.resolve("some value");

    const rejectionHandler = jest.fn();

    promise
        .finally( () => {throw new Error("some error")} )
        .catch(rejectionHandler);

    expect(rejectionHandler.mock.calls.length).toEqual(1);
    expect(rejectionHandler.mock.calls).toEqual([[new Error('some error')]]);
});

test('for a pre-rejected promise FINALLY must be called', () => {
    const promise = new JestMockPromise();

    promise.reject("some error");

    const finalHandler = jest.fn();
    const rejectionHandler = jest.fn();

    promise
        .finally(finalHandler)
        .catch(rejectionHandler);


    expect(finalHandler.mock.calls.length).toEqual(1);
    expect(finalHandler.mock.calls).toEqual([[]]);

    expect(rejectionHandler).not.toBeCalled();
});

test('for a pre-rejected promise if FINALLY throws an error, next promise must be rejected', () => {
    const promise = new JestMockPromise();

    promise.reject("initial error");

    const rejectionHandler = jest.fn();

    promise
        .finally( () => {throw new Error("additional error")} )
        .catch(rejectionHandler);

    expect(rejectionHandler.mock.calls.length).toEqual(1);
    expect(rejectionHandler.mock.calls).toEqual([[new Error('additional error')]]);
});

test('it is assignable as a real Promise', () => {
    const results: string[] = [];

    const somePromisingFunction = (action: Promise<string>) => {
        action.then((value: string) => {
            results.push(value);
        });
    };

    const promise = new JestMockPromise<string>();
    somePromisingFunction(promise);

    promise.resolve("A value");

    expect(results).toContain("A value");
});

test('it behaves like a JavaScript object', () => {
    const result = Object.prototype.toString.call(new JestMockPromise());
    expect(result).toEqual("[object JestMockPromise]");
});
