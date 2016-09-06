(function () {
  'use strict';

  angular
    .module('nested')
    .directive('scrollChangeHandler', scrollChangeHandler);

  /** @ngInject */
  function scrollChangeHandler(NstObservableObject) {
    return {
      restrict : 'E',
      require : '^scrollChangeObserver',
      scope : {
        key : '@observerKey'
      },
      link : function (scope, element, attrs, controller) {
        var key = attrs.handlerKey || 'body-scroll-change';
        controller.container.addEventListener(key, function (event) {
          console.log(event.detail);
        });
      }
    };
  }

})();
