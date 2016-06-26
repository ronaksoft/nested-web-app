/**
 * Created by pouyan on 6/26/16.
 */
(function() {
  'use strict';

  angular
    .module('nested')
    .constant('NST_MODEL_EVENT', {
      CHANGE: 'change'
    })
    .factory('NstModel', NstModel);

  /** @ngInject */
  function NstModel() {
    /**
     * Creates an instance of NstModel
     *
     * @constructor
     */
    function Model() {

    }

    Model.prototype = {

    };

    return Model;
  }
})();
