(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('nstNavbar', Navbar);

  /** @ngInject */
  function Navbar($rootScope,$timeout) {
    return {
      restrict: 'E',
      templateUrl: 'app/components/navbar/full/full-navbar.html',
      controller: 'FullNavbarController',
      controllerAs: 'ctlFullNavbar',
      bindToController: true,
      scope: {
        controls: '=',
        page: '=',
        pictureUrl : '@navPictureUrl',
        pictureClass : '@navPictureClass',
        title : '@navTitle',
        placeId : '@',
        readyToShow : '=',
        readyToAnime : '@'
      },
      link: function (scope, element, $attrs) {
        scope.$watch(function () {
          return $attrs.readyToAnime
        },function () {
          var ready = $attrs.readyToAnime;
          availableNavAnim(ready)
        });
        function availableNavAnim(ready){

          // create a scene

          var controller = new ScrollMagic.Controller({
            container: "body",
            globalSceneOptions: {
              triggerHook: "onLeave"
            }
          });
          var tween,tween2,tween3,tween4,tween5,tween6;
          tween = tween2 = tween3 = tween4 = tween5 = tween6  = new TimelineLite();

          // create tween
          if (element) tween = new TimelineLite()
            .add(TweenLite.to($(element), 1, {css:{transform:'scaleY(0.5)'}, ease:Linear.easeNone}));

          if ($(element).find('.reverse').length > 0) {
            tween5 = new TimelineLite()
              .add(TweenLite.to($('.reverse'), 1, {css:{transform:'scaleY(2)'}, ease:Linear.easeNone}));

            tween6 = new TimelineLite()
              .add(TweenLite.to($('.reverse-move'), 1, {css:{transform:'scaleY(2) translateY(-20px)'}, ease:Linear.easeNone}));
          }


          if ($(element).children().find( "h3" ).length > 0) { tween2 = new TimelineLite()
            .add(TweenLite.to($(element).children().find( "h3" )[0], 1, {css:{color:'transparent'}, ease:Power4.easeOut}));}

          if ($("#content-plus").children().length > 0) {tween3 = new TimelineLite()
            .add(TweenLite.to($("#content-plus"), 1, {css:{transform:'translateY(98px)'}, ease:Linear.easeNone}));}

          if ($("#new-post").length > 0) {tween4 = new TimelineLite()
            .add(TweenLite.to($("#new-post"), 1, {css:{top:'128px'}, ease:Linear.easeNone}));}

          // build scene
          var scene = new ScrollMagic.Scene({duration: 80, offset: 1})
            .setTween([tween,tween2,tween3,tween4,tween5,tween6])
            .addTo(controller);
        }


      }
    };
  }
})();
