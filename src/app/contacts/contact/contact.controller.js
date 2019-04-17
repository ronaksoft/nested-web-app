/**
 * @file src/app/contacts/contact/contact.controller.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A wrapper modal for contact single/list view
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-02
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular.module('ronak.nested.web.contact').controller('ContactController', ContactController);

  /** @ngInject */
  /**
   * A wrapper modal for contact single/list view
   *
   * @param {any} $stateParams
   * @param {any} $uibModalInstance
   * @param {any} $state
   * @param {any} $scope
   */
  function ContactController($stateParams, _, $uibModalInstance, $scope) {
    var vm = this,
      eventReferences = [];

    (function() {
      // Decides about displaying the right view
      if ($stateParams.contactId && $stateParams.contactId.length > 0) {
        vm.mode = 'single';
        vm.contact = $stateParams.contact;
        vm.contactId = $stateParams.contactId;
      } else {
        vm.mode = 'list';
      }
    })();
    // Switches to contact single view
    eventReferences.push($scope.$on('view-contact', function(event, data) {
      vm.mode = 'single';
      vm.contact = data;
      vm.contactId = data.id;
    }));
    // Switches to contact list view
    eventReferences.push($scope.$on('view-contact-list', function() {
      vm.mode = 'list';
    }));
    // Closes the modal
    eventReferences.push($scope.$on('close-modal', function() {
      $uibModalInstance.dismiss();
    }));

    $scope.$on('$destroy', function() {
      _.forEach(eventReferences, function(canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }
})();
