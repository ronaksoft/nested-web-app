(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstObsModel', NstObsModel);

  /** @ngInject */
  function NstObsModel(NstModel) {
    function ObsModel() {

    }

    ObsModel.prototype = new NstModel();

    ObsModel.prototype.addEventListener = function(type, callback, oneTime) {

    };

    ObsModel.prototype.removeEventListener = function(id) {

    };

    ObsModel.prototype.dispatchEvent = function(event) {

    };

    return ObsModel;
  }
})();
