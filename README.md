# What's this?
This is yet another synchronous implementation od JavaScript Promise, written to ease the pain of unit testing. It's written in TypeScript as a support class for an [Jest Mock Axios](https://www.npmjs.com/package/jest-mock-axios).

### Why yet another?
Because of "code first, search later" approach to solving problems.

### Can it be used with Mocha/Jasmine?
We have good news! The answer is Yes! In fact it can be used outside a unit-testing scenario, since it doesn't contain any unit-testing-specific features!

### Why is it then called *jest-mock-promise*?
Because it was originally written as a part of the [jest-mock-axios](https://www.npmjs.com/package/jest-mock-axios) project and still is it's integral part (as an external dependency). So it's name is a legacy of it's humble beginnings :)

# What's in this document?

* [How does it work?](#how-does-it-work)
* [How to use it?](#how-to-use-it)
  * [First example - Traditional async test](#first-example---traditional-async-test)
  * [Second example - Applying the synchronous Promise](#second-example---applying-the-synchronous-promise )
  * [Third example - Mocking `fetch`](#third-example---mocking-fetch)
* [API](#api)

# How does it work?

It works the same way a normal Promise would, with the exception that does it right away (synchronously) and not at later time (async).

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

Synchronous Promise was created to simplify unit testing an async component. So in the next two examples we'll have a look at how we can do just that - simplify a unit test.

## What we'll be testing

We are going to test a component, which multiplies two numbers provided as a payload of a promise. The result is returned a call to a callback function.

The following snippet shows implementation of that component:
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

Now let's write some Jest tests.

## First example - Traditional async test

In our first example we'll create a test in a traditional async way ... just to show how terible it is. Then, in the second example, we'll improve on the original idea by introducing `jest-mock-promise`.

The next snippet contains a test written in traditional async way:
```javascript
// ./src/__test__/component.spec.js
import {onPromiseMultiply} from '../component.js';

describe('testing the multiply component', () => {

    it('should multiply two numbers and provide the result to the callback function', () => {

        let callbackFn = jest.fn();
        let promise = new Promise((resolve, reject) {
            // providing two numbers which need to be multiplied
            // as we know, although we have resolved the promise right away,
            // `then` handlers will be called asnyc at later time
            resolve(1,2);
        });

        // calling the function we want to test
        onPromiseMultiply(promise, callbackFn);

        // Altought promise is already resolved, `then` handlers will
        // be called asnyc at later time. That's why we need to put
        // our expectation inside a `then` handler
        // + we need to return a promise to the Jest, so it knows
        // we're doing some async testing
        return(promise.then(() => {
            expect(callbackFn).toHaveBeenCalledWith(3);
        }));
    });
})
```
As we can see, it's not easy to see the order in which our code gets executed. Can we make this better? Yes we can! In the following section we'll see how ...

## Second example - Applying the synchronous Promise 
The first thing we need to do is install this component: `npm i --save-dev jest-mock-promise`

Since our component uses `es6-promise`, we'll manually mock this dependency (if you don't know what manual mocking is, have a look at [Manual Mocks @ Jest](https://facebook.github.io/jest/docs/en/manual-mocks.html) ). We'll create a `__mocks__` directory inside our project root. There we'll create a `es6-promise.js` file with the following content:
```javascript
// ./__mocks__/es6-promise.js
import JestMockPromise from 'jest-mock-promise';

// mocking the es6-promise, which is used by component we are testing
export { JestMockPromise as Promise };
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
As we can see, reading our code just became much easier! Hooray!

## Third example - Mocking `fetch`

As the final example we can have a look source code of [`jest-mock-fetch`](https://github.com/knee-cola/jest-mock-fetch), which is based on `jest-mock-promise`.

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