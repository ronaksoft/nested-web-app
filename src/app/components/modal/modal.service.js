(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.modal')
    .service('NstSvcModal', NstSvcModal);

  /** @ngInject */
  function NstSvcModal($uibModal) {
    function Modal() {
    }

    Modal.prototype = {};
    Modal.prototype.constructor = Modal;

    Modal.prototype.error = function (title, message) {
      var modal = $uibModal.open({
        animation : false,
        templateUrl : 'app/components/modal/modal-error.html',
        controller : 'ModalErrorController',
        controllerAs : 'errorCtrl',
        size : 'sm',
        resolve : {
          title : function () {
            return title || 'Error';
          },
          reason : function () {
            return message;
          }
        }
      });

      return modal.result;
    };

    return new Modal();
  }
})();
