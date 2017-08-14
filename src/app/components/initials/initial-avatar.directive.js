(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('initialAvatar', function () {
      return {
        scope: {
          initialAvatar : '@',
          name : '@',
          picture : '@',
          width : '@',
          height : '@'
        },
        link: function ($scope, $element,$attrs) {
          initialize($scope.initialAvatar,$scope.name,$scope.picture);
          var watcher = $scope.$watchGroup(["initialAvatar", "name", "picture"], function (newValues) {
            initialize(newValues[0],newValues[1], newValues[2]);
          });


          function initialize(id, name, picture) {
            var abbr,finalColor;
            if( name ) {
              abbr = name.split(' ').slice(0, 2).map(function(item){return item[0]}).join('');
            } else {
              abbr = 'U';
            }

            var c = abbr.toUpperCase();
            var colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FF9800", "#FF5722", "#607D8B"];
            var settings = {
              // Default settings
              name: $scope.name,
              textColor: '#ffffff',
              height: $scope.height || $element[0].height,
              width: $scope.width || $element[0].width,
              fontSize: $attrs.fontSize || 13,
              fontWeight: 400,
              fontFamily: 'HelveticaNeue-Light,Helvetica Neue Light,Helvetica Neue,Helvetica, Arial,Lucida Grande, sans-serif',
              radius: $attrs.radius || 0
            };

            var cobj = $('<text text-anchor="middle"></text>').attr({
                'y': '50%',
                'x': '50%',
                'dy' : '0.35em',
                'pointer-events':'auto',
                'fill': settings.textColor,
                'font-family': settings.fontFamily
            }).html(c).css({
                'font-weight': settings.fontWeight,
                'font-size': settings.fontSize +'px'
            });

            var colorIndex = getIndexStr(id);
            finalColor = colors[colorIndex];

            var svg = $('<svg></svg>').attr({
                'xmlns': 'http://www.w3.org/2000/svg',
                'pointer-events':'none',
                'width': settings.width,
                'height': settings.height
            }).css({
                'background-color': finalColor,
                'width': settings.width+'px',
                'height': settings.height+'px',
                'border-radius': settings.radius+'px',
                '-moz-border-radius': settings.radius+'px'
            });
            svg.append(cobj);
            var svgHtml = window.btoa(unescape(encodeURIComponent($('<div>').append(svg.clone()).html())));

            if (picture && picture.length > 0) {
              $element.attr(
                'src', picture
              );
            } else {
               $element.attr(
                'src', 'data:image/svg+xml;base64,' + svgHtml
              );
            }
          }

          function getIndexStr(username) {
            var value = 0;

            for (var i = 0; i < username.length; i++) {
              value += username.charCodeAt(i);
            }
            return getInitialValue(value);

          }
          function getInitialValue(value) {
              var sum = 0;

              while (value > 0) {
                  sum = sum + value % 10;
                  value = value / 10;
              }

              if (sum < 16) {
                  return Math.floor(sum);
              } else {
                  return getInitialValue(sum);
              }

          }
          $scope.$on('$destroy', function () {
            watcher();
          });
        }
      };
    });

})();
