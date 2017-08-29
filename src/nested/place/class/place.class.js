(function () {
  'use strict';

  angular
    .module('ronak.nested.web.models')
    .factory('NstPlace', NstPlace);

  /** @ngInject */
  function NstPlace(NST_OBJECT_EVENT, NstTinyPlace) {

    function Place() {
      this.privacy = null;

      this.policy = null;

      this.grandParentId = undefined;

      this.counters = {};

      this.limits = {};

      this.unreadPosts = {};

      NstTinyPlace.call(this);
    }

    Place.prototype = new NstTinyPlace();
    Place.prototype.constructor = Place;

    Place.prototype.canAddSubPlace = function() {
      return this.limits && this.counters && this.counters.childs < this.limits.childs;
    }

    return Place;
  }
})();
