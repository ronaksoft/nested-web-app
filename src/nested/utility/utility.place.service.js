(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtilPlace', NstUtilPlace);

  /** @ngInject */
  function NstUtilPlace(_) {
    function PlaceUtility() {

    }
    var PLACE_ID_SEPARATOR = ".";
    PlaceUtility.prototype = {};
    PlaceUtility.prototype.constructor = PlaceUtility;

    PlaceUtility.prototype.isGrand = function (placeId) {
      return _.indexOf(placeId, PLACE_ID_SEPARATOR);
    }

    PlaceUtility.prototype.getGrandId = function (placeId) {
      if (this.hasParent(placeId)) {
        var index = _.indexOf(placeId, PLACE_ID_SEPARATOR);
        return placeId.substring(0, index);
      }

      return "";
    }

    PlaceUtility.prototype.getParentId = function (placeId) {
      if (this.hasParent(placeId)) {
        var index = _.lastIndexOf(placeId, PLACE_ID_SEPARATOR);
        return placeId.substring(0, index);
      }

      return "";
    }

    PlaceUtility.prototype.getGrandParentId = function (placeId, level) {
      if (this.hasParent(placeId)) {
        level = level || 1;
        var index = 0;
        while (level > 0) {
          index = _.indexOf(placeId, PLACE_ID_SEPARATOR, index + 1);
          level--;
        }

        return placeId.substring(0, index);
      }

      return "";
    }

    PlaceUtility.prototype.hasParent = function (placeId) {
      return _.indexOf(placeId, PLACE_ID_SEPARATOR) !== -1;
    }

    PlaceUtility.prototype.getIndentLevel = function (placeId) {
      return _.split(placeId, PLACE_ID_SEPARATOR).length;
    }

    return new PlaceUtility();
  }
})();
