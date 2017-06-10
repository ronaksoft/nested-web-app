(function() {
  'use strict';
  angular
    .module('ronak.nested.web.message')
    .service('SvcEmoji', SvcEmoji);

  /** @ngInject */
  function SvcEmoji($rootScope,$window,$timeout) {
    return {

    getRecent : function () {
      
    },

    setRecent : function (emo) {
      console.log(emo);
    }


    };
  }
})();
