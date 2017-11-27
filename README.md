# What's this?

This is yet another synchronous implementation od JavaScript Promise, written to ease the pain of unit testing. It's written in TypeScript as a support class for an [Axios mock]().

# Why yet another?

Because of "code first, search later" approach to solving problems.

# How does it work?

Well' it works the same way a normal Promise would work, with the exception that does it right away and not at later time.

Let's use the following example to see how a synchronous promise is different from a regular one:

```javascript
let resolveFn;

// creating a new promis
let promise = new Promise((resolve, reject) => {
    // assigning the resolve function a variable from outter scope
    resolveFn = resolve;
    console.log('1. Promise is ready');
});

// attaching a `then` handler
promise.then(() => console.log('2. Promise is resolved'));

// resolving the promise right away
console.log('3. Will resolve the promise');
resolveFn();

console.log('4. Last line of code');
```
The regular promise would produce the following console output:
```
1. Promise is ready
3. Will resolve the promise
4. Last line of code
2. Promise is resolved
```
The *"2. Promise is resolved"* is logged to the console **before** *"4. Last line of code"* because regular promise runs registered hander functions (`then`, `catch`) in the next JavaScript *timeslot*, after all the code has finished executing.

Let's now have a look at what the console output will look like for synchronous promise:
```
1. Promise is ready
3. Will resolve the promise
2. Promise is resolved
4. Last line of code
```
As you can see, the `then` handler was executed **before** the last line of code!

If you've ever tried unit-testing async code, than you'll know how painfull that can be!

# How to use it?

Synchronous Promise is usefull for testing an async component.

We'll look at an exmaple of testing a method, which multiplies two numbers provided as a promise payload, after which it passes the result by calling a callback function. Here's the code of the component we want to test:
```javascript
// ./src/component.js
import Promise from 'es6-promise';

const onPromiseMultiply = (promise, callback) => {
    promise.then((a,b) => {
        callback(a*b);
    })
};

export {onPromiseMultiply};
```
## Testing in the async way
To test this method in a regular Jest test, we would need to write something along these lines:
```javascript
// ./src/__test__/component.spec.js
import {onPromiseMultiply} from '../component.js';

describe('testing the multiply component', () => {

    it('should multiply two numbers and provide the result to the callback function', () => {

        let callbackFn = jest.fn();
        let promise = new Promise((resolve, reject) {
            // providing two numbers which need to be multiplied
            resolve(1,2);
        });

        // calling the function we want to test
        onPromiseMultiply(promise, callbackFn);

        // since the promise will be resolved async,
        // we need to test our expectation inside a `then` handler
        // and also return a promise to the Jest, so it knows
        // we're doing some async testing
        return(promise.then(() => {
            expect(callbackFn).toHaveBeenCalledWith(3);
        }));
    });
})
```
As we can see, we need to have **a hard look** at the code to see the order in which our code gets executed. Can we make this better? Yes we can! In the following section we'll see how ...

## Applying the synchronous Promise 
The first thing we need to do is install this component: `npm i --save-dev jest-sync-promise`

Since our component uses `es6-promise`, we'll manually mock this dependency. We'll create a `__mocks__` directory inside our project root. There we'll create a `es6-promise.js` file with the following content:
```javascript
import SyncPromise from './jest-sync-promise';

// mocking the es6-promise, which is used by Axios
export { SyncPromise as Promise };
```
Now that's set up, we can modify our test:
```javascript
// ./src/__test__/component.spec.js
import {onPromiseMultiply} from '../component.js';

describe('testing the multiply component', () => {

    it('should multiply two numbers and provide the result to the callback function', () => {

        let callbackFn = jest.fn();
        let promise = new Promise();

        // calling the function we want to test
        onPromiseMultiply(promise, callbackFn);

        // resolving our promise
        promise.resolve(1,2);

        // testing to see if our function is working correctly
        expect(callbackFn).toHaveBeenCalledWith(3);
    });
})
```
As we can see, there's no problem in reading this test! Hooray!

# API

The API of this synchronous promise matches the one of the regular Promise, with two additional instance methods (attached to an instance of the Promise):
* `resolve` - resolves a promise instance
* `reject` - rejects a promise instance

This methods do the same job as the ones passed to the main callback function:
```javascript
new Promise((resolve, reject) => { resolve(1,2);  });
```
Having them attached to the instance enables us to call them outside the callback function, which makes our code much more readable:
```javascript
let promise = new Promise();

promise.resolve(1,2);
```

# License
MIT License, http://www.opensource.org/licenses/MIT