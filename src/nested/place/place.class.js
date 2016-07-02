/**
 * Created by pouyan on 6/25/16.
 */
(function () {
  'use strict';

  angular
    .module('nested')
    .constant('NST_PLACE_ACCESS', {
      READ: 'RD',
      WRITE: 'WR',
      READ_POST: 'RD',
      WRITE_POST: 'WR',
      REMOVE_POST: 'D',
      CONTROL: 'C',
      ADD_MEMBERS: 'AM',
      REMOVE_MEMBERS: 'RM',
      SEE_MEMBERS: 'SM',
      REMOVE_PLACE: 'RP',
      ADD_PLACE: 'AP',
      GUEST: 'G'
    })
    .constant('NST_PLACE_MEMBER_TYPE', {
      KEY_HOLDER: 'key_holder',
      KNOWN_GUEST: 'known_guest',
      CREATOR: 'creator'
    })
    .factory('NstPlace', NstPlace);

  /** @ngInject */
  function NstPlace($rootScope, $q, $log,
                    NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_MODEL_EVENT,
                    NstSvcRandomize, AuthService, WsService,
                    NestedUser, StoreItem) {
    /**
     * Creates an instance of NestedPlace. Do not use this directly, use NestedPlaceFactoryService.get(data, requiredFields) instead
     *
     * @param {string|Object} data    Place Info
     * @param {NstPlace}      parent  Place's parent
     *
     * @constructor
     */
    function Place(data, parent) {
      /**
       * Event listeners
       *
       * @type {Object}
       */
      this.listeners = {};

      /**
       * Place Identifier
       *
       * @type {undefined|string}
       */
      this.id = undefined;

      /**
       * Place's grand place
       *
       * @type {undefined|NstPlace}
       */
      this.grandParent = undefined;

      /**
       * Place's name
       *
       * @type {undefined|string}
       */
      this.name = undefined;

      /**
       * Place's description
       *
       * @type {undefined|string}
       */
      this.description = undefined;

      /**
       * Place's children
       *
       * @type {NstPlace[]}
       */
      this.children = [];

      /**
       * Place's parent
       *
       * @type {NstPlace}
       */
      this.parent = parent;
      if (data) {
        this.setData(data);
      }
    }

    Place.prototype = {
      set id(value) {
        // TODO: Jobs on id set
        // TODO: Get from NstPlaceFactory if id is changed
        this.dispatchEvent(new CustomEvent(NST_MODEL_EVENT.CHANGE, {
          detail: {
            newValue: value,
            oldValue: undefined, // TODO: The old value. May be this.<property>
            property: 'id',
            target: this
          }
        }));
      },

      set parent(value) {
        var changed = false;

        if (value instanceof Place) {
          // TODO: Check if should set or returned
          this.parent = value;
          changed = true;
        } else if (angular.isString(value)) {
          // TODO: Get from NstPlaceFactory
          // TODO: Check if should set or returned
          this.parent = undefined;
          changed = true;
        }

        if (changed) {
          this.dispatchEvent(new CustomEvent(NST_MODEL_EVENT.CHANGE, {
            detail: {
              newValue: value, // {NstPlace}
              oldValue: undefined,  // {NstPlace} TODO: The old value. May be this.<property>
              property: 'parent',
              target: this
            }
          }));
        }
      },

      set grandParent(value) {
        var changed = false;

        if (value instanceof Place) {
          // TODO: Check if should set or returned
          this.grandParent = value;
          changed = true;
        } else if (angular.isString(value)) {
          // TODO: Get from NstPlaceFactory
          // TODO: Check if should set or returned
          this.grandParent = undefined;
          changed = true;
        }

        if (changed) {
          this.dispatchEvent(new CustomEvent(NST_MODEL_EVENT.CHANGE, {
            detail: {
              newValue: value, // {NstPlace}
              oldValue: undefined,  // {NstPlace} TODO: The old value. May be this.<property>
              property: 'grandParent',
              target: this
            }
          }));
        }
      },

      /**
       * Fill Place
       *
       * @param {Object} data
       */
      setData: function (data) {
        // TODO: Implement fulfillment
      },

      /**
       * Registers listener to an event
       *
       * @param {NST_MODEL_EVENT} type      Event name
       * @param {function}        callback  Listener function
       * @param {boolean}         oneTime   Whether if listener should be removed after first call or not
       *
       * @returns {string} Listener Id
       */
      addEventListener: function (type, callback, oneTime) {
        if (!(type in this.listeners)) {
          this.listeners[type] = {};
        }

        var id = NstSvcRandomize.genUniqId();

        this.listeners[type][id] = {
          flush: oneTime || false,
          fn: callback
        };

        return id;
      },

      /**
       * Unregisters listener from an event
       *
       * @param {string} id Listener Id
       *
       * @returns {boolean} Success
       */
      removeEventListener: function (id) {
        var result = false;

        for (var type in this.listeners) {
          if (this.listeners[type][id]) {
            delete this.listeners[type][id];

            result = true;
          }
        }

        return result;
      },

      /**
       * Triggers event
       *
       * @param {STORAGE_EVENT} event Event name
       *
       * @returns {*}
       */
      dispatchEvent: function (event) {
        if (!(event.type in this.listeners)) {
          return;
        }

        // event.target = this;
        var flushTank = [];
        for (var k in this.listeners[event.type]) {
          this.listeners[event.type][k].fn.call(this, event);
          this.listeners[event.type][k].flush && flushTank.push(k);
        }

        for (var key in flushTank) {
          this.removeEventListener(key);
        }
      }
    };

    return Place;
  }
})();
