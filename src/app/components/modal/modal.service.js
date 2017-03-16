(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.modal')
    .service('NstSvcModal', NstSvcModal);

  /** @ngInject */
  function NstSvcModal($uibModal, $q) {
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

    Modal.prototype.confirm = function (title, message, buttons) {
      var deferred = $q.defer();

      var modal = $uibModal.open({
        animation : false,
        templateUrl : 'app/components/modal/modal-confirm.html',
        controller : 'ModalConfirmController',
        controllerAs : 'ctlConfirm',
        size : 'sm',
        resolve : {
          title : function () {
            return title || 'Confirm';
          },
          message : function () {
            return message;
          },
          buttons : function () {
            return buttons || {};
          }
        }
      });

      modal.result.then(deferred.resolve).catch(deferred.reject);

      return deferred.promise;
    }

    return new Modal();
  }
})();
