declare enum PromiseState {
    pending = 0,
    resolved = 1,
    rejected = 2
}
declare type AnyFunction<T = any, Y = any> = (...args: Y[]) => T;
declare type HandlerType<T> = {
    then?: AnyFunction<T>;
    catch?: AnyFunction;
    finally?: AnyFunction;
};
export { PromiseState, AnyFunction, HandlerType };
