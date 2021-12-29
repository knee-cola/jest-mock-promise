import { Promise } from 'es6-promise';

const onPromiseMultiply = (promise, callback) => {
    promise.then(([a,b]) => {
        callback(a*b);
    })
};

export {onPromiseMultiply};