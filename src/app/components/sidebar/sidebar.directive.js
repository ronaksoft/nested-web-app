(function() {
  'use strict';

  angular
    .module('nested')
    .controller('SidebarController', function ($q, $uibModal, $location, $scope, $cacheFactory,
                                               WsService, NestedPlace, LoaderService, StorageFactoryService, STORAGE_TYPE, _) {
      var vm = this;
      vm.places = [];
      vm.tpl = 'app/components/nested/place/row.html';

      var memory = StorageFactoryService.create('dt.places', STORAGE_TYPE.MEMORY);
      memory.setFetchFunction(function (id) {
        switch (id) {
          case 'places':
            return WsService.request('account/get_my_places', {}).then(function (data) {
              var places = [];
              $scope.numbers = [];
              for (var k in data.places) {
                places.push(new NestedPlace(data.places[k]));
                $scope.numbers.push(0);
              }

              return $q(function (res) {
                res(this.places);
              }.bind({ places: places }));
            });
            break;

          default:
            return $q(function (res, rej) {
              rej(id);
            });
            break;
        }
      });
      memory.get("places").then(function (value) {
        vm.places = value;
        console.log(vm.places);
        function PlaceDepth(depth) {
          this.depth = depth || 0;
        }
        PlaceDepth.prototype = {
          mapFn: function (place) {
            var pd = new PlaceDepth(this.depth + 1);

            return {
              depth: this.depth,
              children: place.children.map(pd.mapFn.bind(pd))
            };
          }
        };
        var pd = new PlaceDepth();
        var placesDep = vm.places.map(pd.mapFn.bind(pd));
        $scope.dep = placesDep.depth;
        console.log(placesDep);

        return placesDep;
      });
      $scope.range = function(n) {
        return new Array(n);
      };

      // Invitations
      $scope.invitations = {
        length: 0,
        invites: {}
      };
      LoaderService.inject(WsService.request('account/get_invitations').then(function (data) {
        for (var k in data.invitations) {
          if (data.invitations[k].place._id) {
            var invitation = new NestedInvitation(data.invitations[k]);
            $scope.invitations.invites[invitation.id] = invitation;
            $scope.invitations.length++;
          }
        }

        return $q(function (res) {
          res();
        });
      }));
      $scope.decideInvite = function (invitation, accept) {
        return invitation.update(accept).then(function (invitation) {
          $scope.invitations.length--;
          delete $scope.invitations.invites[invitation.id];
        });
      };

      $scope.inviteModal = function () {

        $uibModal.open({
          animation: false,
          templateUrl: 'app/events/partials/invitation.html',
          controller: 'InvitationController',
          size: 'sm',
          scope: $scope
        }).result.then(function () {
          return $location.path('/').replace();
        });
      };

    })
    .directive('nestedSidebar', nestedSidebar);


  /** @ngInject */
  function nestedSidebar() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/sidebar/sidebar.html',
      controller: 'SidebarController',
      controllerAs: 'sidebarCtrl',
      bindToController: true
    };
  }
})();
