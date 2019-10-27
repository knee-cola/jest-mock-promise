declare enum PromiseState {
    pending = 0,
    resolved = 1,
    rejected = 2
}
declare type AnyFunction = (...args: any[]) => any;
declare type HandlerType = {
    then?: AnyFunction;
    catch?: AnyFunction;
    finally?: AnyFunction;
};
export { PromiseState, AnyFunction, HandlerType };
