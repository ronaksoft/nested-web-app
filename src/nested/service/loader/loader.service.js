(function () {
  'use strict';

  angular
    .module('nested')
    .constant('LOADER_EVENTS', {
      FINISHED: '__finished',
      INJECTED: '__injected'
    })
    .service('LoaderService', LoaderService);

  /** @ngInject */
  function LoaderService($q,
                         LOADER_EVENTS) {
    function Loader() {
      this.isFinished = true;
      this.fnQs = [];
      this.counter = {
        injected: 0,
        resolved: 0,
        rejected: 0
      };
      this.promises = [];

      this.listeners = {};
    }

    Loader.prototype = {
      inject: function (promise) {
        if (!(promise.then instanceof Function)) {
          throw "Loader inject accepts promise";
        }

        this.isFinished = false;
        var index = ++this.counter.injected;
        var bindedPromise = promise.then(function () {
          this._indFinished(index);

          return $q(function (res) {
            res.apply(null, this.input);
          }.bind({input: arguments}));
        }.bind(this)).catch(function () {
          this._indFinished(index, true);

          return $q(function (res, rej) {
            rej.apply(null, this.input);
          }.bind({input: arguments}));
        }.bind(this));

        this.promises.push(bindedPromise);
        this.dispatchEvent(new CustomEvent(LOADER_EVENTS.INJECTED, { detail: { promise: bindedPromise } }));

        // TODO: What if returning the promise itself?
        return bindedPromise;
      },

      finished: function () {
        return $q(function (res, rej) {
          if (this.isFinished) {
            res();
          } else {
            this.fnQs.push({
              res: res,
              rej: rej
            });
          }
        }.bind(this));
      },

      _indFinished: function (index, rejected) {
        var state = {
          fine: true
        };
        for (var k in this.promises) {
          Promise.race([this.promises[k], $q(function (res) { res(); }).then(function () { this.state.fine = false; }.bind({state: state}))]);

          if (!state.fine) {
            // Currently not working

            return;
          }
        }

        if (rejected) {
          this.counter.rejected++;
        } else {
          this.counter.resolved++;
        }

        if (this.counter.injected == this.counter.resolved + this.counter.rejected) {
          this.isFinished = true;
          this.dispatchEvent(new CustomEvent(LOADER_EVENTS.FINISHED, {
            detail: {
              promises: this.promises,
              injected: this.counter.injected,
              resolved: this.counter.resolved,
              rejected: this.counter.rejected
            }
          }));

          $q.all(this.promises).then(function () {
            var fnQ;
            while (fnQ = this.fnQs.pop()) {
              if (this.counter.rejected > 0) {
                fnQ.rej.apply(null, arguments);
              } else {
                fnQ.res.apply(null, arguments);
              }
            }

            var q;
            this.counter.resolved = 0;
            this.counter.rejected = 0;
            while (q = this.promises.pop()) {
              this.counter.injected--;
            }
          }.bind(this));
        }
      },

      addEventListener: function (type, callback, oneTime) {
        if (!(type in this.listeners)) {
          this.listeners[type] = [];
        }

        this.listeners[type].push({
          flush: oneTime || false,
          fn: callback
        });
      },

      removeEventListener: function (type, callback) {
        if (!(type in this.listeners)) {
          return;
        }

        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
          if (stack[i].fn === callback) {
            stack.splice(i, 1);

            return this.removeEventListener(type, callback);
          }
        }
      },

      dispatchEvent: function (event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        var stack = this.listeners[event.type];
        // event.target = this;
        var flushTank = [];
        for (var i = 0, l = stack.length; i < l; i++) {
          stack[i].fn.call(this, event);
          stack[i].flush && flushTank.push(stack[i]);
        }

        for (var key in flushTank) {
          this.removeEventListener(event.type, flushTank[key].fn);
        }
      }
    };

    return new Loader();
  }
})();
