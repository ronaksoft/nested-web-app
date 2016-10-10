(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components.navbar')
    .directive('nstNavbar', Navbar);

  /** @ngInject */
  function Navbar() {
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
        readyToShow : '='
      },
      link: function (scope, element, attrs) {
        console.log($(element).children().find( "p" )[0]);
        // create a scene
        var controller = new ScrollMagic.Controller();

        // create tween
        var tween = new TimelineLite()
          .add(TweenLite.to($(element), 1, {css:{height:'88px'}, ease:Linear.easeNone}));

        var tween2 = new TimelineLite()
          .add(TweenLite.to($(element).children().find( "h3" )[0], 1, {css:{color:'transparent'}, ease:Power4.easeOut}));

        var tween3 = new TimelineLite()
          .add(TweenLite.to($("#content-plus"), 1, {css:{transform:'translateY(98px)'}, ease:Linear.easeNone}));

        // build scene
        var scene = new ScrollMagic.Scene({duration: 72, offset: 150})
          .setTween([tween,tween2,tween3])
          .addTo(controller);
      }
    };
  }
})();
