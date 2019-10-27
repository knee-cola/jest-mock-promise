enum PromiseState {
    pending, 
    resolved,
    rejected
 }

 type AnyFunction<ReturnType> = (...args: any[]) => ReturnType

 type HandlerType<T> = {
     then?: AnyFunction<T>
     catch?: AnyFunction<any>,
     finally?:AnyFunction<any>,
 } 

 export {PromiseState, AnyFunction, HandlerType }