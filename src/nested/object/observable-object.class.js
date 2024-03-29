(function() {
  'use strict';

  angular
    .module('ronak.nested.web.common')
    .factory('NstObservableObject', NstObservableObject);

  /** @ngInject */
  function NstObservableObject(NstSvcRandomize, NstObject, NST_OBJECT_EVENT) {
    function ObservableObject(me) {
      if (me) {
        angular.extend(this, me);
      }

      for (var k in this) {
        if (!(this[k] instanceof Function)) {
          var uCamelCase = this.getJsName(k, true);
          // TODO: Use NstObject's instead
          this['set' + uCamelCase] = this['set' + uCamelCase] || (function (name) {
              return function (value) {
                var event = new CustomEvent(NST_OBJECT_EVENT.CHANGE, {
                  detail: {
                    name: name,
                    newValue: value,
                    oldValue: this[name],
                    target: this
                  }
                });
                this[name] = value;
                this.dispatchEvent(event);

                return this;
              };
            })(k);
        }
      }

      NstObject.call(this);

      // Event listeners
      this.eventListeners = {};
    }

    ObservableObject.prototype = new NstObject();
    ObservableObject.prototype.constructor = ObservableObject;

    /**
     * Registers listener to an event
     *
     * @param {NST_OBJECT_EVENT}  type      Event name
     * @param {function}          callback  Listener function
     * @param {boolean}           oneTime   Whether if listener should be removed after first call or not
     *
     * @returns {string} Listener Id
     */
    ObservableObject.prototype.addEventListener = function (type, callback, oneTime) {
      if (!(type in this.eventListeners)) {
        this.eventListeners[type] = {};
      }

      var id = NstSvcRandomize.genUniqId();

      this.eventListeners[type][id] = {
        flush: oneTime || false,
        fn: callback
      };

      return id;
    };

    /**
     * Unregisters listener from an event
     *
     * @param {String} id Listener Id
     *
     * @returns {boolean} Success
     */
    ObservableObject.prototype.removeEventListener = function (id) {
      var result = false;

      for (var type in this.eventListeners) {
        if (this.eventListeners[type][id]) {
          delete this.eventListeners[type][id];

          result = true;
        }
      }

      return result;
    };

    /**
     * Triggers event
     *
     * @param {NST_OBJECT_EVENT} event Event name
     *
     * @returns {*}
     */
    ObservableObject.prototype.dispatchEvent = function (event) {
      if (!(this.eventListeners.hasOwnProperty(event.type))) {
        return;
      }

      // event.target = this;
      var flushTank = [];
      for (var id in this.eventListeners[event.type]) {
        this.eventListeners[event.type][id].fn.call(this, event);
        if (this.eventListeners[event.type][id] && this.eventListeners[event.type][id].flush) {
          flushTank.push(id);
        }
      }

      for (var key in flushTank) {
        this.removeEventListener(flushTank[key]);
      }
    };

    return ObservableObject;
  }
})();
