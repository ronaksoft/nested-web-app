(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('placeFilesModalController', placeFilesModalController);

  /** @ngInject */
  function placeFilesModalController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope, _,
                           NST_PLACE_ACCESS, NST_ATTACHMENT_STATUS, NstSvcAttachmentMap, NstSvcPlaceFactory,
                           NstSvcFileFactory, NstSvcPlaceAccess, NstSvcModal, uploadfiles,
                           NstSvcTranslation, NstSvcAuth, NstSvcWait, NstSvcInteractionTracker) {
    var vm = this;
    var onSelectTimeout = null;
    var eventReferences = [];
    vm.loadMoreCounter = 0;
    vm.keyword = '';
    vm.attachments = [];
    vm.selectedFiles = [];
    vm.places = [];
    vm.breadcrumb = [{
      id: 'Places',
      name: 'Places'
    }];
    vm.files = [];
    vm.loadMoreCounter = 0;

    vm.loadMore = loadMore;
    vm.addToCompose = addToCompose;
    vm.closePopover = closePopover;
    vm.breadcrumbClic = breadcrumbClic;
    vm.unSelectFiles = unSelectFiles;
    vm.getSubPlace = getSubPlace;
    vm.attachClick = attachClick;
    vm.selectToggle = selectToggle;
    vm.placeClick = placeClick;

    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    vm.settings = {
      skip: 0,
      limit: 16
    };
    load();

    function load() {
      // vm.filesLoadProgress = true;
      vm.loadFilesError = false;
      vm.getSubPlace();
      
    }

    function loadMore() {
      if (vm.hasNextPage) {
        vm.loadMoreCounter++;
        NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        load();
      }
    }

    function getSubPlace(placeId) {
      vm.settings.skip = 0;
      vm.files = [];
      if ( placeId ) {
        // NstSvcPlaceFactory.getChildrens(placeId).then(function (places){
        //   vm.places = places;
        // });
        getFiles(placeId) ;
      } else {
        NstSvcPlaceFactory.getGrandPlaces().then(function (places){
          vm.places = places;
        });
      }
    }

    function placeClick(placeId, placeName) {
      if (vm.selectedFiles.length === 0 ) {
        getSubPlace(placeId);
        vm.breadcrumb.push({
          id: placeId,
          name: placeName
        });
      }
    }

    function unSelectFiles() {
      vm.selectedFiles = [];
    }

    function breadcrumbClic(breadcrumb) {
      placeClick(breadcrumb.id, breadcrumb.name);
    }

    function attachClick(attachment) {
      if (vm.selectedFiles.length === 0 || (vm.selectedFiles.length === 1 && vm.selectedFiles[0].id === attachment.id && !vm.selectedFiles[0].selected ) ) {
        openAttachment(attachment);
      } else {
        selectToggle(null, attachment);
      }
    }

    function selectToggle(e, attachment) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      /**
       * maybe the property not defined
       */
      if (attachment.selected) {
        attachment.selected = false;
        vm.selectedFiles = _.remove(vm.selectedFiles, function(item){
          return item.id !== attachment.id;
        });
      } else {
        attachment.selected = true;
        vm.selectedFiles.push(attachment);
      }
    }

    function getFiles(placeId) {
      console.log(placeId);
      var deferred = $q.defer();
      NstSvcFileFactory.get(placeId, null, '', vm.settings.skip, vm.settings.limit).then(function (fileItems) {
        var newFileItems = _.differenceBy(fileItems, vm.files, 'id');
        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip += newFileItems.length;

        vm.files.push.apply(vm.files, newFileItems);
        // vm.loadFilesError = false;
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
        deferred.reject();
      }).finally(function () {
        // vm.filesLoadProgress = false;
      });

      return deferred.promise;
    }

    function addToCompose() {
      uploadfiles(vm.selectedFiles);
      vm.closePopover();
    }

    function openAttachment(attachment){
      $('body').addClass('attach-modal');
      var modal = $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        backdropClass : 'attachmdrop',
        size: 'full',
        resolve: {
          fileViewerItem : function () {
            return attachment;
          },
          fileViewerItems : function () {
            return vm.files;
          },
          fileId : function () {
            return null;
          },
          fileIds : function () {
            return null;
          },
          currentPlaceId: function () {
            return null;
          },
          currentPostId: function () {
            return null;
          }
        }
      }).result.catch(function(){
        $('body').removeClass('attach-modal');
      });

      return modal.result;
    }

    function closePopover() {
      $scope.$dismiss();
    }

    $scope.$on('$destroy', function () {
      if (onSelectTimeout) {
        $timeout.cancel(onSelectTimeout);
      }

      _.forEach(eventReferences, function (cenceler) {
        if (_.isFunction(cenceler)) {
          cenceler();
        }
      });

    });

  }
})();
