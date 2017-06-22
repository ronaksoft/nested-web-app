(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .controller('FilesController', FilesController);

  /** @ngInject */
  function FilesController($stateParams, toastr, $uibModal, $state, $timeout, $q, $scope,
                           NST_PLACE_ACCESS,
                           NstSvcFileFactory, NstSvcPlaceAccess, NstSvcModal,
                           NstSvcTranslation, NstSvcAuth, NstSvcWait, NstSvcInteractionTracker,
                           NstAttachment,
                           NST_DEFAULT) {
    var vm = this;
    var onSelectTimeout = null;
    var eventReferences = [];
    vm.searchTrigg = 0;
    vm.loadMoreCounter = 0;
    vm.keyword = '';

    vm.searchFunc = function () {

      if (vm.keyword.length > 0) {
        vm.keyword = '';
        search(vm.keyword);
      } else {
        ++vm.searchTrigg;
      }

    };

    vm.fileTypes = [
      {
        id: 'ALL',
        label: NstSvcTranslation.get('all')
      },
      {
        id: 'DOC',
        label: NstSvcTranslation.get('documents')
      },
      {
        id: 'IMG',
        label: NstSvcTranslation.get('images')
      },
      {
        id: 'AUD',
        label: NstSvcTranslation.get('audios')
      },
      {
        id: 'VID',
        label: NstSvcTranslation.get('videos')
      },
      {
        id: 'OTH',
        label: NstSvcTranslation.get('others')
      }
    ];

    vm.search = _.debounce(search, 512);
    vm.filter = filter;
    vm.preview = preview;
    vm.loadMore = loadMore;
    vm.onSelect = onSelect;
    vm.compose = composeWithAttachments;
    vm.isSubPersonal = isSubPersonal;

    vm.selectedFiles = [];
    vm.files = [];
    vm.hasPreviousPage = false;
    vm.hasNextPage = false;
    vm.currentPlaceId = null;

    var defaultSettings = {
      filter: 'ALL',
      keyword: '',
      skip: 0,
      limit: 12
    };

    vm.settings = {};

    (function () {
      vm.currentPlaceId = $stateParams.placeId;
      vm.selectedFileType = getSelectedFilter();
      vm.settings = {
        filter: vm.selectedFileType.id,
        search: getSearchParameter() || defaultSettings.search,
        skip: defaultSettings.skip,
        limit: defaultSettings.limit
      };

      if (!$stateParams.placeId || $stateParams.placeId === NST_DEFAULT.STATE_PARAM) {
        throw Error('Could not find Place Id.');
      }

      vm.currentPlaceId = $stateParams.placeId;

      NstSvcPlaceAccess.getIfhasAccessToRead(vm.currentPlaceId).then(function (place) {
        if (place) {
          vm.currentPlace = place;
          vm.currentPlaceLoaded = true;

          vm.hasSeeMembersAccess = place.hasAccess(NST_PLACE_ACCESS.SEE_MEMBERS);
          vm.showPlaceId = !_.includes(['off', 'internal'], place.privacy.receptive);

          load().then(function () {
            eventReferences.push(NstSvcWait.emit('main-done'));
          });
        } else {
          NstSvcModal.error(NstSvcTranslation.get("Error"), NstSvcTranslation.get("Either this Place doesn't exist, or you don't have the permit to enter the Place.")).finally(function () {
            $state.go(NST_DEFAULT.STATE);
          });
        }
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('Sorry, an error has occurred while loading the Place.'));
      });

    })();

    function isSubPersonal() {
      if (vm.currentPlaceId)
        return NstSvcAuth.user.id == vm.currentPlaceId.split('.')[0];
    }

    function search(keyword) {
      vm.settings.keyword = keyword;
      vm.settings.skip = 0;
      vm.files = [];

      load();
    }

    function filter(filter) {
      vm.selectedFileType = filter;
      vm.settings.filter = filter.id;
      vm.files = [];
      load();
    }

    function getSelectedFilter() {
      var value = _.toLower($stateParams.filter);

      return _.find(vm.fileTypes, function (fileType) {
        return _.toLower(fileType.label) === value;
      }) || vm.fileTypes[0];
    }

    function getSearchParameter() {
      var value = $stateParams.search;
      if (!value || value === NST_DEFAULT.STATE_PARAM) {
        return null;
      }

      return decodeURIComponent(value);
    }

    function load() {
      vm.filesLoadProgress = true;
      vm.loadFilesError = false;

      var deferred = $q.defer();

      NstSvcFileFactory.get(vm.currentPlaceId,
        vm.settings.filter,
        vm.settings.keyword,
        vm.settings.skip,
        vm.settings.limit).then(function (fileItems) {
        var newFileItems = _.differenceBy(fileItems, vm.files, 'id');

        vm.hasNextPage = fileItems.length === vm.settings.limit;
        vm.settings.skip += newFileItems.length;

        vm.files.push.apply(vm.files, newFileItems);
        vm.loadFilesError = false;
        deferred.resolve();
      }).catch(function (error) {
        toastr.error(NstSvcTranslation.get('An error has occurred while retrieving files.'));
        vm.loadFilesError = true;
        deferred.reject();
      }).finally(function () {
        vm.filesLoadProgress = false;
      });

      return deferred.promise;
    }

    function mapFiles(files) {
      return _.map(files, function (file) {
        return new NstAttachment(file);
      });
    }

    function preview(file) {

      $uibModal.open({
        animation: false,
        templateUrl: 'app/components/attachments/view/single/main.html',
        controller: 'AttachmentViewController',
        controllerAs: 'ctlAttachmentView',
        backdropClass: 'attachmdrop',
        size: 'full',
        resolve: {
          fileViewerItem: function () {
            return file;
          },
          fileViewerItems: function () {
            return vm.files;
          },
          fileId: function () {
            return null;
          },
          fileIds: function () {
            return null;
          },
          currentPlaceId: function () {
            return vm.currentPlaceId;
          },
          currentPostId: function () {
            return null;
          }
        }
      });

    }

    function loadMore() {
      if (vm.hasNextPage) {
        vm.loadMoreCounter++;
        NstSvcInteractionTracker.trackEvent('files', 'load more', vm.loadMoreCounter);
        load();
      }
    }

    function onSelect(fileIds, el) {
      if (onSelectTimeout) {
        $timeout.cancel(onSelectTimeout);
      }

      onSelectTimeout = $timeout(function () {
        vm.selectedFiles = _.filter(vm.files, function (file) {
          return _.includes(fileIds, file.id);
        });

        var sizes = _.map(vm.selectedFiles, 'size');
        vm.totalSelectedFileSize = _.sum(sizes);
      });
    };

    function composeWithAttachments() {
      $state.go('app.compose', {attachments: vm.selectedFiles}, {notify: false});
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
