/**
 * Created by pouyan on 6/26/16.
 */
(function() {
  'use strict';

  angular
    .module('nested')
    .factory('NstPicture', NstPicture);

  /** @ngInject */
  function NstPicture() {
    /**
     * Creates an instance of NstPicture
     *
     * @param {string}      message Error message
     *
     * @constructor
     */
    function Picture() {
      
    }

    Picture.prototype = {

    };

    return Picture;
  }
})();
