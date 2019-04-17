(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('DisconnectController', DisconnectController);

  /** @ngInject */
  function DisconnectController($scope, NstSvcConnectionMonitor, moment, $interval, _) {
    var vm = this;
    var eventReferences = [];

    vm.retry = retry;
    var counter = null;

    function retry() {
      NstSvcConnectionMonitor.reconnect();
    }

    eventReferences.push($scope.$watch(function () {
      return vm.isDisconnected;
    }, function (newValue) {
      if (newValue) {
        // enable counter
        counter = $interval(function () {
          if (vm.nextRetryTime > 1) {
            vm.nextRetryTime -= 1;
          }
        }, 1000);
      } else {
        // disable the counter
        $interval.cancel(counter);
      }
    }));

    NstSvcConnectionMonitor.onReconnecting = function (data) {
      vm.nextRetryTime = moment.duration(data.time).seconds();
    };

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });

  }
})();
