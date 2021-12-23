enum PromiseState {
    pending, 
    resolved,
    rejected
 }

 type AnyFunction<T=any, Y=any> = (...args: Y[])=>T;

 type HandlerType<T> = {
     then?:AnyFunction<T>,
     catch?:AnyFunction,
     finally?:AnyFunction,
 };

 export {PromiseState, AnyFunction, HandlerType }