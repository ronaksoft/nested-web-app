(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('manageLabelController', manageLabelController);

  function manageLabelController($state, $scope, $q, $uibModalInstance, $uibModal, $filter
    , toastr, _, NstSvcTranslation, NstSearchQuery, NstSvcLabelFactory, NST_LABEL_SEARCH_FILTER, NstSvcAuth) {

    var vm = this;

    vm.keyword = '';
    vm.labelManager = NstSvcAuth.user.authority.labelEditor;
    vm.labels = [];
    vm.haveMore = true;
    vm.requestList = [];
    vm.oldKeyword = '';
    vm.selectedItems = [];
    vm.editLabel = editLabel;
    vm.createLabel = createLabel;
    vm.requestLabel = requestLabel;
    vm.removeSelectedLabels = removeSelectedLabels;
    vm.declineRequest = declineRequest;
    vm.acceptRequest = acceptRequest;
    vm.withdrawRequest = withdrawRequest;
    vm.toggleSelected = toggleSelected;
    vm.searchThis = searchThis;
    vm.changeTab = changeTab;
    vm.selectedView = 0;
    vm.searchKeyUp = _.debounce(searchLabel, 512);
    vm.translation = {
      pending: NstSvcTranslation.get('Pending Requests'),
      request: NstSvcTranslation.get('Requests')
    };
    vm.setting = {
      skip: 0,
      limit: 16
    };

    init();

    function init() {
      searchLabel();
      getRequests();
    }

    function searchLabel() {
      if (vm.oldKeyword !== vm.keyword) {
        restoreDefault();
      }
      if (!vm.haveMore) {
        return;
      }
      var filter = (vm.labelManager && vm.selectedView === 0 ? NST_LABEL_SEARCH_FILTER.ALL : NST_LABEL_SEARCH_FILTER.MY_PRIVATES);

      if (vm.keyword.length > 0) {
        var keyword = $filter('scapeSpace')(vm.keyword);
        NstSvcLabelFactory.search(keyword, filter, vm.setting.skip, vm.setting.limit).then(function(labels) {
          vm.labels = _.unionBy(vm.labels.concat(labels), 'id');
          vm.oldKeyword = vm.keyword;
          vm.haveMore = labels.length === vm.setting.limit;
          vm.setting.skip += labels.length;
        });
      } else {
        NstSvcLabelFactory.search(null, filter, vm.setting.skip, vm.setting.limit, function(cachedLabels) {
          vm.labels = cachedLabels;
        }).then(function (labels) {
          merge(labels);
          vm.oldKeyword = vm.keyword;
          vm.haveMore = labels.length === vm.setting.limit;
          vm.setting.skip += labels.length;
        });
      }
    }

    function merge(labels) {

      var newItems = _.differenceBy(labels, vm.labels, 'id');
      // var removedItems = _.differenceBy(vm.labels, labels, 'id');

      // first omit the removed items; The items that are no longer exist in fresh contacts
      // _.forEach(removedItems, function (item) {
      //   var index = _.findIndex(vm.labels, { 'id': item.id });
      //   if (index > -1) {
      //     vm.labels.splice(index, 1);
      //   }
      // });

      // add new items; The items that do not exist in cached items, but was found in fresh contacts
      vm.labels.push.apply(vm.labels, newItems);
    }

    function restoreDefault() {
      vm.setting.skip = 0;
      vm.labels = [];
      vm.haveMore = true;
    }

    function getRequests() {
      NstSvcLabelFactory.getRequests().then(function (result) {
        vm.requestList = result;
      });
    }

    function editLabel(id) {
      var label = null;
      if (id) {
        label = _.find(vm.labels, {id: id});
      }
      $uibModal.open({
        animation: false,
        size: 'full-height-center multiple',
        templateUrl: 'app/label/partials/edit-label.html',
        controller: 'editLabelController',
        controllerAs: 'ctrl',
        resolve: {
          argv: {
            label: label
          }
        }
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          searchLabel(vm.keyword);
        }
      });
    }

    function createLabel() {
      $uibModal.open({
        animation: false,
        size: 'full-height-center multiple',
        templateUrl: 'app/label/partials/create-label.html',
        controller: 'createLabelController',
        controllerAs: 'createCtrl'
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          searchLabel();
        }
      });
    }

    function requestLabel() {
      $uibModal.open({
        animation: false,
        size: 'full-height-center multiple',
        templateUrl: 'app/label/partials/request-label.html',
        controller: 'requestLabelController',
        controllerAs: 'requestCtrl'
      }).result.then(function (result) {
        if (result) {
          restoreDefault();
          getRequests();
        }
      });
    }

    function removeSelectedLabels() {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/label-confirm-modal.html',
        controller: 'labelConfirmModalController',
        controllerAs: 'confirmModal',
        size: 'sm',
        resolve: {
          modalSetting: {
            title: NstSvcTranslation.get('Remove selected label(s)'),
            body: NstSvcTranslation.get('Are you sure you want to remove selected label(s)?'),
            confirmText: NstSvcTranslation.get('Remove'),
            confirmColor: 'red',
            cancelText: NstSvcTranslation.get('Cancel')
          }
        }
      }).result.then(function () {
        callRemoveLabelPromises().then(function () {
          restoreDefault();
          searchLabel();
          vm.selectedItems = [];
          toastr.success(NstSvcTranslation.get("Selected labels removed successfully."));
        });
      });
    }

    function callRemoveLabelPromises() {
      var labelActionPromises = [];
      for (var i = 0; i < vm.selectedItems.length; i++) {
        labelActionPromises.push(NstSvcLabelFactory.remove(vm.selectedItems[i]));
      }
      return $q.all(labelActionPromises);
    }

    function declineRequest(id) {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/label-confirm-modal.html',
        controller: 'labelConfirmModalController',
        controllerAs: 'confirmModal',
        size: 'sm',
        resolve: {
          modalSetting: {
            title: NstSvcTranslation.get('Decline request!'),
            body: NstSvcTranslation.get('Are you sure you want to decline this request?'),
            confirmText: NstSvcTranslation.get('Decline'),
            confirmColor: 'red',
            cancelText: NstSvcTranslation.get('Cancel')
          }
        }
      }).result.then(function () {
        NstSvcLabelFactory.updateRequest(id, 'reject').then(function () {
          removeRequest(id);
          restoreDefault();
          searchLabel(vm.keyword);
          toastr.success(NstSvcTranslation.get("Request declined successfully."));
        }).catch(function () {
          toastr.error(NstSvcTranslation.get("Something went wrong."));
        });
      });
    }

    function acceptRequest(id) {
      NstSvcLabelFactory.updateRequest(id, 'accept').then(function () {
        removeRequest(id);
        restoreDefault();
        searchLabel(vm.keyword);
        toastr.success(NstSvcTranslation.get("Request accepted successfully."));
      }).catch(function () {
        toastr.error(NstSvcTranslation.get("Something went wrong."));
      });
    }

    function withdrawRequest(id) {
      $uibModal.open({
        animation: false,
        templateUrl: 'app/label/partials/label-confirm-modal.html',
        controller: 'labelConfirmModalController',
        controllerAs: 'confirmModal',
        size: 'sm',
        resolve: {
          modalSetting: {
            title: NstSvcTranslation.get('Withdraw request!'),
            body: NstSvcTranslation.get('Are you sure you want to withdraw?'),
            confirmText: NstSvcTranslation.get('Withdraw'),
            confirmColor: 'red',
            cancelText: NstSvcTranslation.get('Cancel')
          }
        }
      }).result.then(function () {
        NstSvcLabelFactory.cancelRequest(id).then(function () {
          removeRequest(id);
          toastr.success(NstSvcTranslation.get("Your request has been withdrawn successfully."));
        }).catch(function () {
          toastr.error(NstSvcTranslation.get("Something went wrong."));
        });
      });
    }

    function removeRequest(id) {
      var index;
      index = _.findIndex(vm.requestList, {id: id});
      vm.requestList.splice(index, 1);
    }

    function toggleSelected(id, checked) {
      var index;
      if (checked) {
        vm.selectedItems.push(id);
      } else {
        index = _.findIndex(vm.selectedItems, {id: id});
        vm.selectedItems.splice(index, 1);
      }
    }

    function changeTab () {
      restoreDefault();
      searchLabel(vm.keyword);
    }

    function searchThis(title) {
      var searchQuery = new NstSearchQuery('');

      searchQuery.addLabel(title);

      $state.go('app.search', {search: NstSearchQuery.encode(searchQuery.toString())});

      $scope.$dismiss();
    }
  }

})();
