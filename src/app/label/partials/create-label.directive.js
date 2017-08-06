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
          console.log('click');
          if ( isManager ){
            $uibModal.open({
                animation: false,
                size: 'lg-white multiple',
                templateUrl: 'app/label/partials/create-label.html',
                controller: 'createLabelController',
                controllerAs: 'ctrl'
            })
          } else {
            $uibModal.open({
                animation: false,
                size: 'lg-white multiple',
                templateUrl: 'app/label/partials/request-label.html',
                controller: 'requestLabelController',
                controllerAs: 'ctrl'
            })
          }
        }
        $scope.$on('$destroy', function () {
          console.log('destroy');
          $element[0].removeEventListener("click", onClickHandler);
        });
      }

    };

  }
})();
