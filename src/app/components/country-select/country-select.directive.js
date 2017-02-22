(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('countrySelect', countrySelect);


  function countrySelect(NST_COUNTRIES_ATLAS) {

    return {
      restrict: 'E',
      templateUrl: 'app/components/country-select/country-select.html',
      scope: {
        selectedCountryCode: '=',
        autoLocate: '='
      },
      link: function($scope, $element, $attrs) {
        $scope.countries = _.map(NST_COUNTRIES_ATLAS, function(country) {
          return {
            id: country[1],
            text: country[0],
            code: Number(country[2])
          };
        });

        $scope.search = search;

        function search(keyword) {
          $scope.countries = _.chain($scope.allCountries).filter(function (country) {
            return _.toLower(country.text).indexOf(_.toLower(keyword)) !== -1;
          }).orderBy([function (country) {
            return _.startsWith(_.toLower(country.text), _.toLower(keyword));
          }], ['desc']).value();
        }

        $scope.$watch('selected', function (newValue, oldValue) {
          $scope.$emit('country-select-changed', newValue);
        });

        $scope.$watch('selectedCountryCode', function (newValue, oldValue) {
          if (newValue) {
            if (!$scope.selected || ($scope.selected && $scope.selected.code !== _.toNumber(newValue))) {
              setSelectedCountryByCode(newValue);
            }
          }
        });

        if ($attrs.initialCountry) {
          setSelectedCountryById($attrs.initialCountry);
        }

        
        if ($scope.autoLocate) {
          geoIpLookup(function(id) {
            setSelectedCountryById(id);
          });
        }

        function setSelectedCountryById(id) {
          var lowerId = _.toLower(id);
          $scope.selected = _.find($scope.countries, { id : lowerId });
        }

        function setSelectedCountryByCode(code) {
          $scope.selected = _.find($scope.countries, { code : _.toNumber(code) });
        }
      }

    };

    function geoIpLookup(callback) {
      $.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
        var countryCode = (resp && resp.country) ? resp.country : "";
        callback(countryCode);
      });
    }

  }

})();
