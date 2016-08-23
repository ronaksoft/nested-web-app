(function () {
  'use strict';

  angular
    .module('nested')
    .controller('SearchController', SearchController);

  /** @ngInject */
  function SearchController($rootScope, $log, $stateParams, $state, $timeout,
    NstSvcPostFactory, NstSvcPostMap, NstSvcServer, NstSvcAuth,
    NstSearchQuery) {
    var vm = this;
    var limit = 8;
    var skip = 0;

    vm.reachedTheEnd = false;
    vm.loading = false;
    vm.loadMessageError = false;
    vm.noResult = false;
    vm.messages = [];
    vm.viewSetting = {
      content: true,
      attachments: true,
      comments: false,
    };


    vm.suggestedItems = [{
      type : 'user',
      name : 'Foo',
      id : 'foo'
    },
    {
      type : 'account',
      name : 'Bar',
      id : 'bar'
    }];

    vm.search = search;
    vm.loadMore = loadMore;

    (function () {

      var query = getUriQuery();
      vm.queryString = query.toString();
      searchMessages(vm.queryString);
    })();

    function search(queryString) {
      vm.messages.length = 0;
      skip = 0;
      var query = new NstSearchQuery(queryString);
      $state.go('search', { query : NstSearchQuery.encode(queryString) } , { notify : false }).then(function (newState) {
        skip = 0;
        searchMessages(query.toString());
      });
    }

    function getUriQuery() {
      return new NstSearchQuery(_.trimStart($stateParams.query, '_'));
    }

    function searchMessages(queryString) {
      vm.loading = true;
      vm.loadMessageError = false;
      vm.reachedTheEnd = false;

      NstSvcPostFactory.search(queryString, limit, skip).then(function (posts) {
        var olderMessages = _.map(posts, NstSvcPostMap.toSearchMessageItem);
        _.forEach(olderMessages, function (message) {
          if (!_.some(vm.messages, { id : message.id })){
            vm.messages.push(message);
          }
        });

        vm.noResult = vm.messages.length === 0;
        vm.reachedTheEnd = olderMessages.length > 0 && olderMessages.length < limit;

        vm.loading = false;

      }).catch(function (error) {
        $log.debug(error);
        vm.loadMessageError = true;
        vm.loading = false;
      });
    }

    function loadMore() {
      skip = vm.messages.length;
      searchMessages(vm.queryString);
    }



    vm.bodyScrollConf = {
      axis: 'y',
      callbacks: {
        // whileScrolling: function () {
        //   var t = -this.mcs.top;
        //   //$timeout(function () { $rootScope.navView = t > 55; });
        //   //console.log(tl);
        //   // tl.kill({
        //   //   y: true
        //   // }, cp);
        //   // TweenLite.to(cp, 0.5, {
        //   //   y: 140,
        //   //   ease: Power2.easeOut,
        //   //   force3D: true
        //   // });
        //   if (t > 55 && !$rootScope.navView) {
        //     //$('#content-plus').clone().prop('id', 'cpmirror').appendTo("#mCSB_3_container");
        //     //var z = $('#content-plus').offset().left + 127;
        //     //console.log(z);
        //     //$('#cpmirror').css({'opacity':0});
        //     //$('#content-plus').css({position: 'fixed',marginLeft: 356});
        //     //tl.kill({minHeight:true,maxHeight:true}, nav);
        //     // TweenLite.to(nav, 0.1, {
        //     //   minHeight: 96,
        //     //   maxHeight: 96,
        //     //   height: 96,
        //     //   ease: Power1.easeOut
        //     // });
        //     $timeout(function () {
        //       $rootScope.navView = t > 55;
        //     });
        //   } else if (t < 55 && $rootScope.navView) {
        //     // TweenLite.to(nav, 0.1, {
        //     //   minHeight: 183,
        //     //   maxHeight: 183,
        //     //   height: 183,
        //     //   ease: Power1.easeOut
        //     // });
        //     $timeout(function () {
        //       $rootScope.navView = t > 55;
        //     });
        //   }
        //
        //   //tl.lagSmoothing(200, 20);
        //   tl.play();
        //   // $("#content-plus").stop().animate(
        //   //   {marginTop:t}, {duration:1});
        //   // TweenMax.to("#cp1", .001, {
        //   //   y: t, ease:SlowMo.ease.config(0.7, 0.7, true)
        //   // });
        //   //TweenMax.lagSmoothing(500, 33);
        //
        //
        //   //   var func = function () {
        //   //     console.log(t);
        //   //     $("#content-plus").animate(
        //   //       {marginTop:t}, {duration:1, easing:"easeOutStrong"});
        //   //   };
        //   //   var debounced = _.debounce(func, 250, { 'maxWait': 1000 });
        //   //   if ( t > 0) {
        //   //     debounced();
        //   //   } else if(t == 0){
        //   //   $("#content-plus").stop().css({
        //   //     marginTop: 0
        //   //   });
        //   // }
        // },
        onTotalScroll: function () {
          vm.loadMore();
        },
        onTotalScrollOffset: 10,
        alwaysTriggerOffsets: false
      }
    };
  }

})();
