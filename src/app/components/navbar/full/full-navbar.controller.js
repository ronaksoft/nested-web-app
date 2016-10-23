(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .controller('FullNavbarController', FullNavbarController);

  /** @ngInject */
  function FullNavbarController($scope, $rootScope, $uibModal, $state, $q,
    toastr, NstUtility,
    NstSvcAuth, NstSvcLogger,
    NstSearchQuery, NstSvcPlaceFactory,
    NST_DEFAULT, NST_PLACE_FACTORY_EVENT, NST_PLACE_ACCESS, NST_PLACE_MEMBER_TYPE, NST_SRV_ERROR) {
    var vm = this;
    /*****************************
     *** Controller Properties ***
     *****************************/

    isBookMark();
    vm.user = NstSvcAuth.getUser();
    vm.hasPlace = hasPlace;
    vm.getPlaceId = getPlaceId;
    vm.getMessagesUrl = getMessagesUrl;
    vm.getActivityUrl = getActivityUrl;
    vm.getSettingsUrl = getSettingsUrl;
    vm.search = search;
    vm.rollUpward = rollUpward;
    vm.rollToTop = false;
    vm.place = null;
    vm.toggleBookmark = toggleBookmark;
    vm.toggleNotification = toggleNotification;
    vm.openCreateSubplaceModal = openCreateSubplaceModal;
    vm.openAddMemberModal = openAddMemberModal;


    vm.srch = function srch(el) {
      var ele = $('#' + el);
      var eleInp = ele.find('input');
      var elePrv = ele.next();
      var openStat = function () {
        return ele[0].clientWidth > 0
      };
      function open() {
        ele.stop().animate({
          maxWidth : 1000
        },300);
        eleInp.focus();
      }
      function close() {
        ele.stop().animate({
          maxWidth : 0
        },100);
        eleInp.val("");
      }
      elePrv.stop().fadeToggle('slow','swing');
      if (openStat()) {
        close()
      } else {
        open()
      }
    };

    vm.showSettingsModal = function () {
      // Show plce settings
      $uibModal.open({
        animation: false,
        size: 'lg-white',
        templateUrl: 'app/place/place-settings/settings.html',
        controller: 'PlaceSettingsController',
        controllerAs: 'ctlSettings',
        resolve: {
          tempPlaceId : function (){
            return "sport";
          }
        }
      }).result.then(function (result) {

      });
    };

    function openCreateSubplaceModal ($event) {
      $event.preventDefault();
      $state.go('app.place-create', { placeId : getPlaceId() } , { notify : false });
    };

    function openAddMemberModal($event) {
      $event.preventDefault();
      NstSvcPlaceFactory.get(vm.getPlaceId()).then(function (place) {
        vm.place = place;
        var role = NST_PLACE_MEMBER_TYPE.KEY_HOLDER;
        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'app/pages/places/settings/place-add-member.html',
          controller: 'PlaceAddMemberController',
          controllerAs: 'addMemberCtrl',
          size: 'sm',
          resolve: {
            chosenRole: function() {
              return role;
            },
            currentPlace: function() {
              return vm.place;
            }
          }
        });

        modal.result.then(function(selectedUsers) {
          $q.all(_.map(selectedUsers, function(user) {

            return $q(function(resolve, reject) {
              NstSvcPlaceFactory.addUser(vm.place, role, user).then(function(invitationId) {
                toastr.success(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.place.id));
                NstSvcLogger.info(NstUtility.string.format('User "{0}" was invited to Place "{1}" successfully.', user.id, vm.place.id));
                resolve({
                  user: user,
                  role: role,
                  invitationId: invitationId
                });
              }).catch(function(error) {
                // FIXME: Why cannot catch the error!
                if (error.getCode() === NST_SRV_ERROR.DUPLICATE) {
                  toastr.warning(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.place.id));
                  NstSvcLogger.info(NstUtility.string.format('User "{0}" was previously invited to Place "{1}".', user.id, vm.place.id));
                  resolve({
                    user: user,
                    role: role,
                    invitationId: null,
                    duplicate: true
                  });
                } else {
                  reject(error);
                }
              });
            });

          })).then(function(values) {
            _.forEach(values, function(result) {
              if (!result.duplicate) {
                if (result.role === NST_PLACE_MEMBER_TYPE.KEY_HOLDER) {
                  // vm.teammates.push(new NstVmMemberItem(result.user, 'pending_' + result.role));
                }
              }
            });
          }).catch(function(error) {
            NstSvcLogger.error(error);
          });
        });
      }).catch(function (error) {
        NstSvcLogger.error(error);
      });

    }

    function getPlaceId() {
      return vm.placeId;
    }

    function hasPlace() {
      return !!vm.placeId;
    }


    function getMessagesUrl() {
      if (hasPlace()) {
        return $state.href('app.place-messages', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('app.messages');
      }
    }
    function getActivityUrl() {
      if (hasPlace()) {
        return $state.href('app.place-activity', { placeId : vm.getPlaceId() });
      } else {
        return $state.href('app.activity');
      }
    }
    function getSettingsUrl() {
      if (hasPlace()) {
        return $state.href('app.place-settings', { placeId : vm.getPlaceId() });
      } else {
        return '';
      }
    }
    function rollUpward(group) {
      if (group === $state.current.options.group) {
        vm.rollToTop = true;
      }
    }
    function isBookMark() {
      if ($state.current.name == 'app.messages-bookmarks' ||
        $state.current.name == 'app.messages-bookmarks-sorted'){
        vm.isBookmarkMode = true;
        return true;
      }
      return false;
    }

    function toggleBookmark() {
      vm.isBookmarked = !vm.isBookmarked;
      NstSvcPlaceFactory.setBookmarkOption(vm.placeId, '_starred', vm.isBookmarked).then(function(result) {

      }).catch(function(error) {
        vm.isBookmarked = !vm.isBookmarked;
      });
    }

    function toggleNotification() {
      vm.notificationStatus= !vm.notificationStatus;
      NstSvcPlaceFactory.setNotificationOption(vm.placeId, vm.notificationStatus).then(function(result) {

      }).catch(function(error) {
        vm.notificationStatus = !vm.notificationStatus;
      });
    }

    /**
     * sendKeyIsPressed - check whether the pressed key is Enter or not
     *
     * @param  {Event} event keypress event handler
     * @return {bool}        true if the pressed key is Enter
     */
    function sendKeyIsPressed(event) {
      return 13 === event.keyCode && !(event.shiftKey || event.ctrlKey);
    }

    function search(query, event) {

      var element = angular.element(event.target);
      if (!sendKeyIsPressed(event) || !query || element.attr("mention") === "true") {
        return;
      }
      var searchQury = new NstSearchQuery(query);

      if (hasPlace()){
        searchQury.addPlace(getPlaceId());
      }

      $state.go('app.search', { query : NstSearchQuery.encode(searchQury.toString()) });
    }


    $scope.$watch(
      function () {
        return vm.placeId
      },function () {
        if (vm.placeId) {
          NstSvcPlaceFactory.getBookmarkedPlaces()
            .then(function (bookmaks) {
              if (bookmaks.indexOf(vm.placeId) >= 0) vm.isBookmarked = true;
            });

          NstSvcPlaceFactory.getNotificationOption(vm.placeId)
            .then(function (status) {
              vm.notificationStatus = status;
            });

          $q.all([
            NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_MEMBERS),
            NstSvcPlaceFactory.hasAccess(vm.placeId, NST_PLACE_ACCESS.ADD_PLACE)]).then(function (resultSet) {
              vm.allowedToAddMember = resultSet[0];
              vm.allowedToAddPlace = resultSet[1];
            }).catch(function (error) {
              NstSvcLogger.error(error);
            });
        }
      }
    );

    $scope.$watch('topNavOpen',function (newValue,oldValue) {
      $rootScope.topNavOpen = newValue;
    });



    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_ADD, function (e) {
      if (e.detail.id === vm.placeId) vm.isBookmarked = true;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.BOOKMARK_REMOVE, function (e) {
      if (e.detail.id === vm.placeId) vm.isBookmarked = false;
    });


    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.NOTIFICATION_ON, function (e) {
      if (e.detail.id === vm.placeId) vm.notificationStatus= true;
    });

    NstSvcPlaceFactory.addEventListener(NST_PLACE_FACTORY_EVENT.NOTIFICATION_OFF, function (e) {
      if (e.detail.id === vm.placeId) vm.notificationStatus= false;
    });
  }
})();
