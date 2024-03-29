(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('createLabel', createLabel);

  /** @ngInject */
  function createLabel($location, $rootScope, $uibModal) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
        var isManager = $attrs.hasOwnProperty('labelManager') && $attrs.labelManager === 'true';
        var htmlTxt = '<a>' + (isManager ?
                        '<translate>New Label</translate>' :
                        '<translate>Request a Label</translate>') +
                      '</a>' +
                      '<svg class="_16svg _df _fn">' +
                        '<use xlink:href="/assets/icons/nst-icn16.svg#cross"></use>' +
                      '</svg>';
        $element.html(htmlTxt);
        $element[0].addEventListener("click", onClickHandler);

        /**
         * @function createLabel
         * Opens the create label modal
         * @param {any} $event
         */
        function onClickHandler(){
          if ( isManager ){
            $uibModal.open({
                animation: false,
                size: 'full-height-center multiple',
                templateUrl: 'app/label/partials/create-label.html',
                controller: 'createLabelController',
                controllerAs: 'ctrl'
            })
          } else {
            $uibModal.open({
                animation: false,
                size: 'full-height-center multiple',
                templateUrl: 'app/label/partials/request-label.html',
                controller: 'requestLabelController',
                controllerAs: 'requestCtrl'
            })
          }
        }
        $scope.$on('$destroy', function () {
          $element[0].removeEventListener("click", onClickHandler);
        });
      }

    };

  }
})();
