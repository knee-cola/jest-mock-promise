/**
 * Synchronous Promise, which gets settled (resolved or settled) in a synchronous manner.
 * 
 * `JestMockPromise` was written to simplify unit testing mocking (i.e. in [Jest](https://facebook.github.io/jest/) )
 * 
 * In order to simplify synchronious promise settling two additional methods
 * were added to the promise instance:
 *   - `resolve` = forces the given promise to be resolved right away
 *   - `reject` = forces the given promise to be rejected right away
 * 
 * By using these methods, we can write something like (provided that the Promise is mocked):
 * 
 *    let promise = ExternalComponent.doAsyncWork();
 *    promise.resolve({ label: 'this is some mock data' });
 * 
 * @author   knee-cola<nikola.derezic@gmail.com>
 * @license  @license MIT License, http://www.opensource.org/licenses/MIT
 * 
 */

import { PromiseState, AnyFunction, HandlerType } from './jest-mock-promise-types';

type QueueItem<T> = {
    /** handler registered with `this` */
    onFulfilled?:AnyFunction<any, T>,
    /** handler registered with `catch` or `this` */
    onRejected?:AnyFunction<any, T>,
    /** handler registered with `finally` */
    onFinally?:AnyFunction<any, T>,
    /** chained promise */
    nextPromise:JestMockPromise,
    /** value returned by `onFulfilled` */
    nextValue?:T,
    /** value set by `reject` method */
    err?:any
};

type Queue<T> = Array<QueueItem<T>>;

type ResolveLevelItem = {
    instance: JestMockPromise,
    value?:any,
    err?:any,
    newState: PromiseState
};

type ResolveLevel = ResolveLevelItem[];

class JestMockPromise<T = any> {

    protected queue:Queue<T>;

    /** value with wich the promise was resolved */
    private value:T;
    /** error with wich the promise was rejected */
    private err:any;
    /** current state of the promise */
    protected state:PromiseState;

    constructor(callbackFn?:(x?:any,y?:any)=>any) {

        this.queue = [];
        this.state = PromiseState.pending;

        // if given, calling the given function
        if(callbackFn) {
            callbackFn(this.resolve.bind(this), this.reject.bind(this));
        }
    }

    /**
     * Resolves promises at a given level
     * @param currLevel list of promises which need to be resolved at this level
     */
    private static processLevel(currLevel:ResolveLevel):void {

        if(currLevel.length === 0) return;

        let nextLevel:ResolveLevel = [];

        currLevel.forEach(({instance, value, err, newState}) => {
            let { queue } = instance;

            instance.state = newState;
            instance.value = value;
            instance.err = err;

            queue.forEach(({ nextPromise, onFulfilled, onRejected, onFinally }, ix) => {

                // by default pass the original value and state to the next level
                let nextLevelItem:ResolveLevelItem = {
                    instance: nextPromise,
                    value,
                    err,
                    newState 
                };

                switch(newState) {
                    case PromiseState.resolved:
                        if(onFulfilled) {
                            try {
                                nextLevelItem.value = onFulfilled(value); // call the handler
                            } catch(err:any) {
                                // reject the next promise
                                nextLevelItem = {
                                    instance: nextPromise,
                                    err,
                                    newState: PromiseState.rejected
                                };
                            }
                        }
                        break;
                    case PromiseState.rejected:
                        if(onRejected) {
                            try {
                                // reject returns no value
                                onRejected(err);
                                // after the error is caught - the promise is RESOLVED
                                nextLevelItem.newState = PromiseState.resolved;
                            } catch(err:any) {
                                // attach new error the the next level
                                // - we do not need to change the state -> it remains rejected
                                nextLevelItem.err = err;
                            }

                        } else {
                            // IF the catch is handled
                            // > throw the error!
                            setTimeout(() => {
                                console.error(`Uncaught (in promise) Error: ${err}`);
                                // not throwing an exception in order not to brake unit tests
                                // throw new Error(`Uncaught (in promise) Error: ${err}`)
                            });
                        }
                        break;
                }
                        
                // IF handler is registered
                if(onFinally) {
                    try {
                        // finally accepts no params and returns nothing
                        onFinally();
                    } catch(err:any) {
                        // reject the next promise
                        nextLevelItem = {
                            instance: nextPromise,
                            err,
                            newState: PromiseState.rejected
                        };
                    }
                }

                nextLevel.push(nextLevelItem);
            });
        });

        // resolve the next level promises (recursive call)
        JestMockPromise.processLevel(nextLevel);
    }

    /**
     * Appends fulfillment and rejection handlers to the promise,
     * and returns a new promise resolving to the return value of
     * the called handler, or to its original settled value if the
     * promise was not handled (i.e. if the relevant handler
     * onFulfilled or onRejected is not a function).
     * @param onFulfilled fulfillment handler function
     * @param onRejected rejection handler function
     */
    public then(onFulfilled:AnyFunction<any, T>, onRejected?:AnyFunction):JestMockPromise<T> | any {
        if (typeof onFulfilled !== 'function') {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
            // "onFulfilled: A Function called if the Promise is fulfilled.
            // This function has one argument, the fulfillment value.
            // If it is not a function, it is internally replaced with an
            // "Identity" function (it returns the received argument)"
            onFulfilled = x => x;
        }

        let nextPromise:JestMockPromise = new JestMockPromise();

        // if the promise is already settled (resolved or rejected)
        // > call the apropriate handler
        switch(this.state) {
            case PromiseState.rejected:
                if(onRejected) {
                    try {
                        onRejected(this.err);
                        nextPromise.resolve(); // since the rejection is caught, the next promise is resolved
                    } catch(ex:any) {
                        nextPromise.reject(ex);
                    }
                } else {
                    // if the rejection is not caught
                    // > reject the next promise
                    nextPromise.reject(this.err);
                }
                break;
            case PromiseState.resolved:
                try {
                    nextPromise.resolve(onFulfilled(this.value) );
                } catch(ex:any) {
                    nextPromise.reject(ex);
                }
                break;
            default:
                break;
        }

        this.queue.push({
            onFulfilled,
            onRejected,
            nextPromise
        });

        // in order to allow chaining we need to return the new Promise
        return(nextPromise);
    }

    /**
     * Appends a rejection handler callback to the promise,
     * and returns a new promise resolving to the return
     * value of the callback if it is called, or to its
     * original fulfillment value if the promise is instead
     * fulfilled.
     * @param onRejected rejection handler function
     */
    public catch(onRejected:AnyFunction) {

        let nextPromise:JestMockPromise = new JestMockPromise();

        // if the promise is already rejected
        // > call the handler right away
        if(this.state === PromiseState.rejected) {
            try {
                onRejected(this.err);
                nextPromise.resolve(); // after a the error is caught the next promise is resolved
            } catch(ex:any) {
                nextPromise.reject(ex);
            }
        }

        this.queue.push({
            onRejected,
            nextPromise
        });

        return(nextPromise);
    }

    /**
     * Appends a finally handler callback to the promise
     * @param onFinally finally handler function
     */
    public finally(onFinally:AnyFunction) {
        let nextPromise:JestMockPromise = new JestMockPromise();

        // if the promise is already resolved or rejected
        // > call the handler right away
        if(this.state !== PromiseState.pending) {
            try {
                onFinally();
                nextPromise.resolve(this.value);
            } catch(ex:any) {
                nextPromise.reject(ex);
            }
        }

        this.queue.push({
            onFinally,
            nextPromise
        });

        return(nextPromise);
    }

    /**
     * Resolves the promise with the given promise data.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} value 
     */
    public resolve(value?:T) {
        JestMockPromise.processLevel([{ instance: this, value, newState: PromiseState.resolved }]);
    }

    /**
     * Rejects the promise with the given promise with the given error object.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} data 
     */
    public reject(err?:any) {
        JestMockPromise.processLevel([{ instance: this, err, newState: PromiseState.rejected }]);
    }

    /**
     * Creates a resolved promise with the given data
     * @param data data which should be passed to `then` handler functions
     */
    static resolve<T=any>(data?:any):JestMockPromise<T> {
        return(new JestMockPromise<T>((resolve, reject) => {
            setTimeout(() => resolve(data), 100);
        }));
    }

    /**
     * Creates a rejected promise with the given data
     * @param err error object which is to be passed as a param to `catch` function
     */
    static reject<T=any>(err?:any):JestMockPromise<T> {
        return(new JestMockPromise<T>((resolve, reject) => {
            setTimeout(() => reject(err), 0);
        }));
    }
}

export default JestMockPromise;
