(function (){
  'use strict';
  angular
    .module('nested')
    .controller('nstMention', MentionController)

    function MentionController ($scope, $rootScope, $http, $q, $sce, $timeout, mentioUtil) {

    $scope.tinyMceOptions = {
      init_instance_callback: function(editor) {
        $scope.iframeElement = editor.iframeElement;
      }
    };
      
    // shows the use of dynamic values in mentio-id and mentio-for to link elements
    $scope.myIndexValue = "5";

    $scope.searchPlaces = function(term) {
      var placeList = [];

      return $http.get('.json').then(function (response) {
        angular.forEach(response.data, function(item) {
          if (item.title.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
            placeList.push(item);
          }
        });

        $scope.places = placeList;
        return $q.when(placeList);
      });
    };

    $scope.searchPeople = function(term) {
      var peopleList = [];
      return $http.get('.json').then(function (response) {
        angular.forEach(response.data, function(item) {
          if (item.name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
            peopleList.push(item);
          }
        });
        $scope.people = peopleList;
        return $q.when(peopleList);
      });
    };

    $scope.searchSimplePeople = function(term) {
      return $http.get('.json').then(function (response) {
        $scope.simplePeople = [];
        angular.forEach(response.data, function(item) {
          if (item.label.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
            $scope.simplePeople.push(item);
          }
        });
      });
    };

    $scope.getProductText = function(item) {
      return '[~<strong>' + item.sku + '</strong>]';
    };

    $scope.getProductTextRaw = function(item) {
      var deferred = $q.defer();
      /* the select() function can also return a Promise which ment.io will handle
       propertly during replacement */
      // simulated async promise
      $timeout(function() {
        deferred.resolve('#' + item.sku);
      }, 500);
      return deferred.promise;
    };

    $scope.getPeopleText = function(item) {
      // note item.label is sent when the typedText wasn't found
      return '[~<i>' + (item.name || item.label) + '</i>]';
    };

    $scope.getPeopleTextRaw = function(item) {
      return '@' + item.name;
    };

    $scope.resetDemo = function() {
      // finally enter content that will raise a menu after everything is set up
      $timeout(function() {
        var html = "";
        var htmlContent = document.querySelector('#htmlContent');
        if (htmlContent) {
          var ngHtmlContent = angular.element(htmlContent);
          ngHtmlContent.html(html);
          ngHtmlContent.scope().htmlContent = html;
          // select right after the @
          mentioUtil.selectElement(null, htmlContent, [0], 8);
          ngHtmlContent.scope().$apply();
        }
      }, 0);
    };
  }
})();
