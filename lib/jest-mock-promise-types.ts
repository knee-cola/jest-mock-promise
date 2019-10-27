enum PromiseState {
    pending, 
    resolved,
    rejected
 }

 type AnyFunction = (...args: any[])=>any;

 type HandlerType = {
     then?:AnyFunction,
     catch?:AnyFunction,
     finally?:AnyFunction,
 };

 export {PromiseState, AnyFunction, HandlerType }