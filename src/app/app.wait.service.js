(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.i18n')
    .service('NstSvcWait', NstSvcWait);

  /** @ngInject */
  function NstSvcWait($rootScope) {
    function Wait() {

    }

    Wait.prototype.emit = function (key) {
      return $rootScope.$emit(key);
    }

    /**
     * all - Waits for all events to be fired
     *
     * @param  {Array}    events  Array of event keys to wait for
     * @param  {Function} action  A collback
     * @return {null}
     */
    Wait.prototype.all = function (events, action) {
      var listeners = {};
      var happend = [];
      // create a listener for all events
      _.forEach(events, function (key) {

        listeners[key] = $rootScope.$on(key, function (event, data) {
          // do not track an event more than once
          if (_.includes(happend, key)) {
            event.preventDefault();
            return;
          }

          // cancel the event listener
          listeners[key]();

          happend.push(key);
          // all events happened once
          if (_.size(happend) === _.size(events)) {
            // exectute the callback
            action();
            cancelListeners(listeners);
          }
        });
      });
    }

    function cancelListeners(listeners) {
      _.forIn(listeners, function (value, key) {
        if (_.isFunction(value)) {
          value();
        }
      });
    }

    return new Wait();
  }
})();
