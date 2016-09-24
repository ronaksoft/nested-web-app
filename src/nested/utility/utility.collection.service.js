(function () {
  'use strict';

  angular
    .module('nested')
    .service('NstUtilCollection', NstUtilCollection);

  /** @ngInject */
  function NstUtilCollection() {
    function CollectionUtility() {

    }

    CollectionUtility.prototype = {};
    CollectionUtility.prototype.constructor = CollectionUtility;

    /**
     * anonymous function - Removes the element from the array by matching ID
     *
     * @param  {Array}  collection The array which the item should be removed from
     * @param  {String} id         ID of the item
     * @return {Array}             The array
     */
    CollectionUtility.prototype.dropById = function (collection, id) {
      if (_.isArray(collection) && collection.length > 0) {
        var index = _.findIndex(collection, { id : id });
        if (index > -1) {
          collection.splice(index, 1);
        }
      }

      return collection;
    };

    return new CollectionUtility();
  }
})();
