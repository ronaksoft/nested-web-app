(function () {
  'use strict';

  angular
    .module('ronak.nested.web.message')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($log, _, $stateParams, $state, $scope,
                            NST_DEFAULT, NstSvcPostFactory, NstSvcTaskFactory,
                            NstSearchQuery) {
    var vm = this;
    var limit = 8;
    var skip = 0;

    var eventReferences = [];
    vm.searchParams = [];
    vm.reachedTheEnd = false;
    vm.loading = false;
    vm.loadMessageError = false;
    vm.noResult = false;
    vm.messages = [];
    vm.viewSetting = {
      content: true,
      attachments: true,
      comments: false
    };


    vm.search = search;
    vm.loadMore = loadMore;
    vm.backToPlace = backToPlace;
    vm.openContacts = openContacts;

    (function () {

      var query = getUriQuery();
      vm.queryString = query.toString();
      vm.refererPlaceId = query.getDefaultPlaceId();
      vm.searchParams = query.getSearchParams();
      searchMessages();
    })();

    function getRouteParams(query) {
      if (isAdvanced()) {
        return {
          search: NstSearchQuery.encode(query.toAdvancedString()),
          advanced: 'true'
        }
      } else {
        return {
          search: NstSearchQuery.encode(query.toString()),
          advanced: 'false'
        }
      }
    }

    function openContacts($event) {
      $state.go('app.contacts', {}, {
        notify: false
      });
      $event.preventDefault();
    }

    function search(queryString) {
      vm.messages.length = 0;
      var query = new NstSearchQuery(queryString);
      vm.searchParams = query.getSearchParams();
      if (!isTask()) {
        $state.go('app.search', getRouteParams(query)).then(function () {
          skip = 0;
          searchMessages();
        });
      } else {
        console.log('hey');
        $state.go('app.task.search', getRouteParams(query)).then(function () {
          skip = 0;
          searchMessages();
        });
      }
    }

    function getUriQuery() {
      return new NstSearchQuery(_.trimStart($stateParams.search, '_'));
    }

    function searchMessages() {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      if (isTask()) {
        taskSearch(isAdvanced());
      } else {
        if (isAdvanced()) {
          advancedSearch();
        } else {
          normalSearch();
        }
      }
    }

    function normalSearch() {
      NstSvcPostFactory.newSearch(
        vm.searchParams.places.join(','),
        vm.searchParams.users.join(','),
        vm.searchParams.labels.join(','),
        vm.searchParams.keywords.join(' '),
        limit,
        skip).then(function (posts) {
        _.forEach(posts, function (message) {
          if (!_.some(vm.messages, {id: message.id})) {
            vm.messages.push(message);
          }
        });
        vm.noResult = vm.messages.length === 0;
        vm.reachedTheEnd = vm.messages.length > 0 && posts.length < limit;
        vm.loading = false;
      }).catch(function (error) {
        $log.debug(error);
        vm.loadMessageError = true;
        vm.loading = false;
      });
    }

    function advancedSearch() {
      var params = {
        places: vm.searchParams.places.join(','),
        users: vm.searchParams.users.join(','),
        labels: vm.searchParams.labels.join(','),
        keywords: vm.searchParams.keywords.join(' '),
        subject: vm.searchParams.subject,
        hasAttachment: vm.searchParams.hasAttachment
      };
      if (vm.searchParams.before !== null && vm.searchParams.after !== null) {
        _.merge(params, {
          before: vm.searchParams.before,
          after: vm.searchParams.after
        });
      }

      NstSvcPostFactory.advancedSearch(
        params,
        limit,
        skip).then(function (posts) {
        _.forEach(posts, function (message) {
          if (!_.some(vm.messages, {id: message.id})) {
            vm.messages.push(message);
          }
        });
        vm.noResult = vm.messages.length === 0;
        vm.reachedTheEnd = vm.messages.length > 0 && posts.length < limit;
        vm.loading = false;
      }).catch(function (error) {
        $log.debug(error);
        vm.loadMessageError = true;
        vm.loading = false;
      });
    }

    function taskSearch(advanced) {
      var params = {
        assignors: vm.searchParams.users.join(','),
        assignees: vm.searchParams.tos.join(','),
        labels: vm.searchParams.labels.join(','),
        keywords: vm.searchParams.keywords.join(' ')
      };
      if (advanced === true) {
        params = _.merge(params, {
          hasAttachment: vm.searchParams.hasAttachment,
        });
      }
      NstSvcTaskFactory.search(
        params,
        limit,
        skip).then(function (posts) {
        _.forEach(posts, function (message) {
          if (!_.some(vm.messages, {id: message.id})) {
            vm.messages.push(message);
          }
        });
        vm.noResult = vm.messages.length === 0;
        vm.reachedTheEnd = vm.messages.length > 0 && posts.length < limit;
        vm.loading = false;
      }).catch(function () {
        vm.loadMessageError = true;
        vm.loading = false;
      });
    }

    function isAdvanced() {
      return ($stateParams.advanced === 'true');
    }

    function isTask() {
      return ($state.current.options && $state.current.options.group === 'task');
    }

    function loadMore() {
      if (vm.reachedTheEnd) {
        return;
      }

      skip = vm.messages.length;
      searchMessages();
    }

    function backToPlace() {
      if (vm.refererPlaceId){
        $state.go('app.place-messages', { placeId : vm.refererPlaceId});
      } else {
        $state.go(NST_DEFAULT.STATE);
      }
    }
    eventReferences.push($scope.$on('scroll-reached-bottom', function () {
      vm.loadMore()
    }));

    $scope.$on('$destroy', function () {
      _.forEach(eventReferences, function (canceler) {
        if (_.isFunction(canceler)) {
          canceler();
        }
      });
    });
  }

})();
