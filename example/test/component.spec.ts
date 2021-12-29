import { onPromiseMultiply } from '../src/component';
import Promise from 'jest-mock-promise';

describe('testing the multiply component', () => {

    it('should multiply two numbers and provide the result to the callback function', () => {

        let callbackFn = jest.fn();
        let promise = new Promise<[number,number]>(() => {});

        // calling the function we want to test
        onPromiseMultiply(promise, callbackFn);

        // resolving our promise
        promise.resolve([1,2]);

        // testing to see if our function is working correctly
        expect(callbackFn).toHaveBeenCalledWith(1*2);
    });
})