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
import { PromiseState, AnyFunction } from './jest-mock-promise-types';
declare type QueueItem<T> = {
    /** handler registered with `this` */
    onFulfilled?: AnyFunction<any, T>;
    /** handler registered with `catch` or `this` */
    onRejected?: AnyFunction<any, T>;
    /** handler registered with `finally` */
    onFinally?: AnyFunction<any, T>;
    /** chained promise */
    nextPromise: JestMockPromise;
    /** value returned by `onFulfilled` */
    nextValue?: T;
    /** value set by `reject` method */
    err?: any;
};
declare type Queue<T> = Array<QueueItem<T>>;
declare class JestMockPromise<T = any> {
    protected queue: Queue<T>;
    /** value with wich the promise was resolved */
    private value;
    /** error with wich the promise was rejected */
    private err;
    /** current state of the promise */
    protected state: PromiseState;
    constructor(callbackFn?: (x?: any, y?: any) => any);
    /**
     * Resolves promises at a given level
     * @param currLevel list of promises which need to be resolved at this level
     */
    private static processLevel;
    /**
     * Appends fulfillment and rejection handlers to the promise,
     * and returns a new promise resolving to the return value of
     * the called handler, or to its original settled value if the
     * promise was not handled (i.e. if the relevant handler
     * onFulfilled or onRejected is not a function).
     * @param onFulfilled fulfillment handler function
     * @param onRejected rejection handler function
     */
    then(onFulfilled: AnyFunction<any, T>, onRejected?: AnyFunction): JestMockPromise<T> | any;
    /**
     * Appends a rejection handler callback to the promise,
     * and returns a new promise resolving to the return
     * value of the callback if it is called, or to its
     * original fulfillment value if the promise is instead
     * fulfilled.
     * @param onRejected rejection handler function
     */
    catch(onRejected: AnyFunction): JestMockPromise<any>;
    /**
     * Appends a finally handler callback to the promise
     * @param onFinally finally handler function
     */
    finally(onFinally: AnyFunction): JestMockPromise<any>;
    /**
     * Resolves the promise with the given promise data.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} value
     */
    resolve(value?: T): void;
    /**
     * Rejects the promise with the given promise with the given error object.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} data
     */
    reject(err?: any): void;
    /**
     * Creates a resolved promise with the given data
     * @param data data which should be passed to `then` handler functions
     */
    static resolve<T = any>(data?: any): JestMockPromise<T>;
    /**
     * Creates a rejected promise with the given data
     * @param err error object which is to be passed as a param to `catch` function
     */
    static reject<T = any>(err?: any): JestMockPromise<T>;
}
export default JestMockPromise;
