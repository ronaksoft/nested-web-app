(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.attachment')
    .directive('nstPanzoom', NstPanzoom);

  function NstPanzoom(NST_FILE_TYPE, _) {
    return {
      restrict: 'A',
      scope: {
        containerClass: '=nstPanzoom',
        fileType: '=fileType'
      },
      link: function ($scope, $element) {
        if ($scope.fileType !== NST_FILE_TYPE.IMAGE) {
          return;
        }
        var eventReferences = [];
        var template =
          '<div class="nst-panzoom-container">' +
            '<div class="nst-panzoom-item" rel="reset"><span class="unfilled-rect"></span></div>' +
            '<div class="nst-panzoom-item" rel="in">+</div>' +
            '<div class="nst-panzoom-item" rel="out">-</div>' +
          '</div>';
        $element.parents($scope.containerClass).append(template);

        $element.addClass('cursor-pan');

        var zoom = 1.0;
        var pan = {
          x: 0,
          y: 0
        };
        var origin = {
          x: 0,
          y: 0
        };
        var panStartPos = {
          x: 0,
          y: 0
        };

        var startPan = false;
        var toolsElem = angular.element($scope.containerClass + ' .nst-panzoom-container');
        eventReferences.push(toolsElem.find('.nst-panzoom-item[rel="in"]').on('click', function () {
          zoom += 0.1;
          applyChanges();
        }));
        eventReferences.push(toolsElem.find('.nst-panzoom-item[rel="out"]').on('click', function () {
          zoom -= 0.1;
          applyChanges();
        }));
        eventReferences.push(toolsElem.find('.nst-panzoom-item[rel="reset"]').on('click', function () {
          zoom = 1.0;
          pan.x = 0;
          pan.y = 0;
          applyChanges();
        }));
        eventReferences.push($element.on('mousedown', function (e) {
          startPan = true;
          panStartPos.x = e.pageX - pan.x;
          panStartPos.y = e.pageY - pan.y;
          applyChanges();
        }));
        eventReferences.push(angular.element('body').on('mousemove', function (e) {
          if (startPan) {
            e.preventDefault();
            pan.x = (e.pageX - panStartPos.x);
            pan.y = (e.pageY - panStartPos.y);
            applyChanges();
          }
          origin.x = 0;
          origin.y = 0;
        }));
        eventReferences.push(angular.element('body').on('mouseup', function (e) {
          if (startPan) {
            e.preventDefault();
          }
          startPan = false;
        }));

        eventReferences.push($element.on('mousewheel', function (e) {
          zoom += (-e.deltaY)/100;
          applyChanges();
          if (origin.x === 0 && origin.y === 0) {
            origin.x = e.pageX - pan.x;
            origin.y = e.pageY - pan.y;
          }
        }));


        function applyChanges() {
          if (zoom < 0.1) {
            zoom = 0.1;
          }
          if (zoom > 10) {
            zoom = 10;
          }
          $element.css('transform', 'scale(' + zoom + ') translate(' + (pan.x/zoom) + 'px, ' + (pan.y/zoom) + 'px)');
        }

        $scope.$on('$destroy', function() {
          toolsElem.remove();
          _.forEach(eventReferences, function (event) {
            event.off();
          });
        });
      }
    }
  }
})();
