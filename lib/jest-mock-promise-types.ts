enum PromiseState {
    pending, 
    resolved,
    rejected
 }

 type AnyFunction = (any)=>any;

 type HandlerType = {
     then?:AnyFunction,
     catch?:AnyFunction
 };

 export {PromiseState, AnyFunction, HandlerType }