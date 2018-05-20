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

  angular.module('ronak.nested.web.app').controller('AppsController', AppsController);

  function AppsController($stateParams, _, $uibModalInstance, $scope, $rootScope, 
      NstSvcAppFactory, $q, NstSvcModal, NstSvcTranslation,
    $uibModal) {
    var vm = this,
      eventReferences = [];

    vm.search = _.debounce(search, 512);
    vm.view = view;
    vm.removeApp = removeApp;
    vm.gotoAddApps = gotoAddApps;

    (function () {
      search(null);
    })();

    function get() {
      var deferred = $q.defer();

      vm.loadProgress = true;
      NstSvcAppFactory.getAllTokens().then(function (apps) {
        deferred.resolve(apps);
        // deferred.resolve( _.map(apps, function(app){ return app.app}));
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get("An error occured while loading your contacts list."));
        deferred.reject(error);
      }).finally(function () {
        vm.loadProgress = false;
      });

      return deferred.promise;
    }

    function search(keyword) {
      get().then(function (apps) {
        scrollTop()
        var filteredItems = _.filter(apps, function (apps) {
            return contactHasKeyword(apps, keyword);
          });

        if (keyword && keyword.length > 0) {
          vm.favorites = [];
        } else {
          // vm.favorites = orderItems(_.filter(filteredItems, { 'starred' : true }));
        }
        vm.apps = _.chain(filteredItems)
          .groupBy(function (app) {
            var orderFactor = getOrderFactor(app);
            var firstChar = getFirstChar(orderFactor);
            if (firstChar && firstChar.length === 1) {

              if (isNumber(firstChar)) {

                return "#";
              }

              return firstChar;
            }

            // This is for contacts without name!
            return "?";
          })
          .map(function (value, key) {
            return {
              key: key,
              items: orderItems(value)
            };
          })
          .orderBy([function (group) {
            return group.key;
          }], ['asc'])
          .value();
      });
    }

    function orderItems(items) {
      return _.orderBy(items, [function (item) {
        return getOrderFactor(item);
      }], ['asc'])
    }

    function getOrderFactor(app) {
      return app.app.name || app.app.id;
    }

    function gotoAddApps() {
      $uibModal.open({
        animation: false,
        size: '960',
        templateUrl: 'app/settings/apps/partials/create-token.html',
        controller: 'CreateTokenController',
        resolve: {
          myApps: function () {
            var items = [];
            _.forEach(vm.apps, function(appGroup) {
              _.forEach(appGroup.items, function(app) {
                items.push(app);
              });
            });
            return items;
          }
        },
        controllerAs: 'ctrl'
      }).result.then(function(){search()}).catch(function(){search()});
    }

    function contactHasKeyword(app, keyword) {
      var fullName = _.toLower(app.app.name),
          id = _.toLower(app.app.id),
          word = _.toLower(keyword);

      return _.includes(fullName, word) || _.includes(id, word);
    }

    function getFirstChar(word) {
      return _.chain(word).head().toLower().value();
    }

    function isNumber(character) {
      return !_.isNaN(_.toNumber(character));
    }

    function scrollTop() {
      if (_.isFunction($scope.scrollToTop)) {
        $scope.scrollToTop();
      }
    }

    function removeApp(event, token) {
      event.preventDefault();
      event.stopPropagation();
      NstSvcModal.confirm(NstSvcTranslation.get("Confirm"), NstSvcTranslation.get("By deleting this app you will terminate all Application permissions to your account")).then(function (result) {
        if (result) {
          NstSvcAppFactory.revokeToken(token).then(function(respones) {
            if (respones = {}){
              _.remove(vm.apps, function(a) {
                return a.items[0].token === token;
              }); 
              $rootScope.$emit('remove-token', {token: token});
            } else {
              toastr.error(NstSvcTranslation.get("An error occured while deleting this app."));
            }
          });
        }
      });
    }

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
