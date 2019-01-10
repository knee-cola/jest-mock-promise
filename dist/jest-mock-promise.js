!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["jest-mock-promise"]=t():e["jest-mock-promise"]=t()}("undefined"!=typeof self?self:this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var s=n[r]={i:r,l:!1,exports:{}};return e[r].call(s.exports,s,s.exports,t),s.l=!0,s.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:r})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){"use strict";/**
 * Synchronous Promise, which gets settled (resolved or settled) in a synchronous manner.
 *
 * `JestMockPromise` was written to simplify unit testing mocking (i.e. in [Jest](https://facebook.github.io/jest/) )
 *
 * In order to simplify synchronious promise settling two additional methods
 * were added to the promise instance:
 *   - `resolve` = forces the given promise to be resolved right away
 *   - `reject` = forces the given promise to be rejected right away
 *
 * By using these methods, we can write something like (provided that the Promise is mocked):
 *
 *    let promise = ExternalComponent.doAyncWork();
 *    promise.resolve({ label: 'this is some mock data' });
 *
 * @author   knee-cola<nikola.derezic@gmail.com>
 * @license  @license MIT License, http://www.opensource.org/licenses/MIT
 *
 */
Object.defineProperty(t,"__esModule",{value:!0});var r=n(1),s=function(){function e(e){this.handlers=[],this.handlerIx=0,this.state=r.PromiseState.pending,e&&e(this.resolveFn.bind(this),this.rejectFn.bind(this))}return e.prototype.resolveFn=function(e){this.data=e,this.state=r.PromiseState.resolved,this.err=void 0;for(var t=this.handlers.length;this.handlerIx<t;this.handlerIx++){var n,s=this.handlers[this.handlerIx];if(s.catch)break;if(!s.finally){try{n=s.then(this.data)}catch(e){this.handlerIx++,this.rejectFn(e)}void 0!==n&&(this.data=n)}}this.finallyFn()},e.prototype.rejectFn=function(e){this.state=r.PromiseState.rejected,this.err=e;for(var t=this.handlers.length;this.handlerIx<t;this.handlerIx++){var n,s=this.handlers[this.handlerIx];if(s.catch){n=s.catch(e),this.handlerIx++,this.resolveFn(n),this.finallyFn();break}}},e.prototype.finallyFn=function(){for(var e=0;e<this.handlers.length;e++){var t=this.handlers[e];t.finally&&(t.finally(),this.handlers.splice(e,1),e--)}},e.prototype.then=function(e,t){switch(this.state){case r.PromiseState.rejected:t&&t(this.err);break;case r.PromiseState.resolved:e(this.data);break;default:this.handlers.push({then:e}),t&&this.handlers.push({catch:t})}return this},e.prototype.catch=function(e){return this.state===r.PromiseState.resolved?e(this.err):this.handlers.push({catch:e}),this},e.prototype.finally=function(e){return this.state===r.PromiseState.resolved?e():this.handlers.push({finally:e}),this},e.prototype.resolve=function(e){this.resolveFn(e)},e.prototype.reject=function(e){this.rejectFn(e)},e.resolve=function(t){return console.warn("a promise created via `JestMockPromise.resolve` will be executed async ... for sync execution call `resolve` method on an instance of `Promise`"),new e(function(e,n){setTimeout(e(t),0)})},e.reject=function(t){return console.warn("a promise created via `JestMockPromise.reject` will be executed async ... for sync execution call `reject` method on an instance of `Promise`"),new e(function(e,n){setTimeout(n(t),0)})},e}();t.default=s},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r;!function(e){e[e.pending=0]="pending",e[e.resolved=1]="resolved",e[e.rejected=2]="rejected"}(r||(r={})),t.PromiseState=r}])});
//# sourceMappingURL=jest-mock-promise.js.map