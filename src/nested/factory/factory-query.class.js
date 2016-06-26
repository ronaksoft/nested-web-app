/**
 * Created by pouyan on 6/26/16.
 */
(function() {
  'use strict';
  angular
    .module('nested')
    .factory('NstFactoryQuery', NstFactoryQuery);

  /** @ngInject */
  function NstFactoryQuery() {
    function FactoryQuery(id, data) {
      this.id = id;
      this.data = data;
    }

    FactoryQuery.prototype = {
      /**
       * Retrieves identifier which was queried
       *
       * @returns {string}
       */
      getId: function () {
        return this.id;
      },

      /**
       * Retrieves data belong to query
       *
       * @returns {*}
       */
      getData: function () {
        return this.data;
      }
    };

    return FactoryQuery;
  }
})();
