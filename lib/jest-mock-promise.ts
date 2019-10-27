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
 *    let promise = ExternalComponent.doAyncWork();
 *    promise.resolve({ label: 'this is some mock data' });
 * 
 * @author   knee-cola<nikola.derezic@gmail.com>
 * @license  @license MIT License, http://www.opensource.org/licenses/MIT
 * 
 */

import { PromiseState, AnyFunction, HandlerType } from './jest-mock-promise-types';
import { returnStatement } from '@babel/types';

class JestMockPromise {

    private handlers:Array<HandlerType>;
    private handlerIx:number;
    private data:any;
    private err:any;
    private state:PromiseState;

    constructor(callbackFn?:(x?:any,y?:any)=>any) {

        this.handlers = [];
        this.handlerIx = 0;
        this.state = PromiseState.pending;

        // if given, calling the given function
        if(callbackFn) {
            callbackFn(this.resolveFn.bind(this), this.rejectFn.bind(this));
        }
    }

    /**
     * Resolves the given promise
     * @param value data which should be passed to `then` handler functions
     */
    private resolveFn(value?:any):void {

        this.data = value;

        this.state = PromiseState.resolved;
        this.err = void 0;

        for(var maxIx=this.handlers.length; this.handlerIx<maxIx; this.handlerIx++) {
            var el:HandlerType = this.handlers[this.handlerIx];

            // stop the execution at first `catch` handler you run into
            if(el.catch) {
                break;
            }

            if(el.finally) {
                this.callFinally();
                return;
            }

            try {
                // calling a `then` handler
                value = el.then(value);
            } catch(ex) {
                // in case `then` or a `finally` handler throws an error
                // > pass it down to a first `catch` handler
                this.handlerIx++;
                this.rejectFn(ex);
            }
        };
    }

    /**
     * Rejects the given promise
     * @param err error object which is to be passed as a param to `catch` function
     */
    private rejectFn(err:any):void {
        
        this.state = PromiseState.rejected;
        this.err = err;

        // find the first `catch` handler and call it
        for(var maxIx=this.handlers.length; this.handlerIx<maxIx; this.handlerIx++) {
            var el:HandlerType = this.handlers[this.handlerIx],
                returnedValue:any;

            if(el.catch) {
                try {
                    returnedValue = el.catch(err);
                    // try executing `then`/`finally` handlers which follow
                    this.handlerIx++;
                    this.resolveFn(returnedValue);
                    // stop the execution as soon as you run into a first catch element
                    break;
                } catch(ex) {
                    // in an error was thrown within `catch` block
                    // > pass it down to closest `catch` handler
                    this.handlerIx++
                    this.rejectFn(ex);
                    break; // the execution will continue from `rejectFn`
                }
            } else if(el.finally) {
                this.callFinally();
            }
        };
    }

    /**
     * Calls `finally` handlers
     */
    private callFinally():void {

        /** is set to `true` after a successful `finally` call */
        let callNextThen = false;

        // find the first `finally` and call it
        for(var maxIx=this.handlers.length; this.handlerIx<maxIx; this.handlerIx++) {

            let el:HandlerType = this.handlers[this.handlerIx];
            
            try {
                if(el.finally) {
                    // calling a `finally` handler
                    el.finally(); // finally doesn't receive any data
                    callNextThen = true; // if `then` is next - call it
                } else if(el.then && callNextThen) {
                    // if you run into `then` right after finally > let the dedicated handler process it
                    this.resolveFn();
                    break; // the execution will continue from `resolveFn`
                } else if(el.catch) {
                    callNextThen = false;
                    continue; // skipping `catch` and search for the next `finally`
                }
            } catch(ex) {
                // in case `then` or a `finally` handler throws an error
                // > pass it down to a first `catch` handler
                this.handlerIx++;
                this.rejectFn(ex);
                break; // the execution will continue from `rejectFn`
            }
        }
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
    public then(onFulfilled:AnyFunction, onRejected?:AnyFunction):JestMockPromise {

        // if the promise is already settled (resolved or rejected)
        // > call the apropriate handler
        switch(this.state) {
            case PromiseState.rejected:
                if(onRejected) {
                    onRejected(this.err);
                }
                break;
            case PromiseState.resolved:
                onFulfilled(this.data);
                break;
            default:
                this.handlers.push({ then: onFulfilled });

                if(onRejected) {
                    this.handlers.push({ catch: onRejected });
                }
        }

        return(this);
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
        // if the promise is already rejected
        // > call the handler right away
        if(this.state === PromiseState.rejected) {
            onRejected(this.err);
        } else {
            this.handlers.push({ catch: onRejected });
        }

        return(this);
    }

    /**
     * Appends a finally handler callback to the promise
     * @param onFinally finally handler function
     */
    public finally(onFinally:AnyFunction) {
        // if the promise is already resolved or rejected
        // > call the handler right away
        if(this.state !== PromiseState.pending) {
            onFinally();
        } else {
            this.handlers.push({ finally: onFinally });
        }

        return(this);
    }

    /**
     * Resolves the promise with the given promise data.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} data 
     */
    public resolve(data?:any) {
        this.resolveFn(data);
    }

    /**
     * Rejects the promise with the given promise with the given error object.
     * This is a non-standard method, which should be the last
     * one to be called, after all the fulfillment and rejection
     * handlers have been registered.
     * @param {*} data 
     */
    public reject(err?:any) {
        this.rejectFn(err);
    }

    /**
     * Creates a resolved promise with the given data
     * @param data data which should be passed to `then` handler functions
     */
    static resolve(data?:any):JestMockPromise {
        console.warn('a promise created via `JestMockPromise.resolve` will be executed async ... for sync execution call `resolve` method on an instance of `Promise`');
        return(new JestMockPromise((resolve, reject) => {
            setTimeout(resolve(data), 0);
        }));
    }

    /**
     * Creates a rejected promise with the given data
     * @param err error object which is to be passed as a param to `catch` function
     */
    static reject(err?:any):JestMockPromise {
        console.warn('a promise created via `JestMockPromise.reject` will be executed async ... for sync execution call `reject` method on an instance of `Promise`');
        return(new JestMockPromise((resolve, reject) => {
            setTimeout(reject(err), 0);
        }));
    }
}

export default JestMockPromise;
