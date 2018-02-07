/**
 * @file src/app/components/country-select/country-select.directive.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description The user selects a country between the provided items list
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-09
 * Reviewed by:            -
 * Date of review:         -
 */
(function() {
  'use strict';

  angular
    .module('ronak.nested.web.components')
    .directive('countrySelect', countrySelect);


  /**
   * Provides a list of countries with their telephone code. The component also has
   * auto-locate feature. It selects your country automatically based on your IP address.
   *
   * @param {any} NST_COUNTRIES_ATLAS
   * @returns
   */
  function countrySelect(NST_COUNTRIES_ATLAS, _, $) {

    return {
      restrict: 'E',
      templateUrl: 'app/components/country-select/country-select.html',
      scope: {
        selectedCountryCode: '=',
        autoLocate: '='
      },
      link: function($scope, $element, $attrs) {
        var eventReferences = [];
        $scope.countries = _.map(NST_COUNTRIES_ATLAS, function(country) {
          return {
            id: country[1],
            text: country[0],
            code: Number(country[2])
          };
        });

        $scope.search = search;

        $scope.selected = '';

        /**
         * Finds the countries that matches the keyword
         *
         * @param {any} keyword
         */
        function search(keyword) {
          $scope.countries = _.chain($scope.allCountries).filter(function (country) {
            return _.toLower(country.text).indexOf(_.toLower(keyword)) !== -1;
          }).orderBy([function (country) {
            return _.startsWith(_.toLower(country.text), _.toLower(keyword));
          }], ['desc']).value();
        }

        eventReferences.push($scope.$watch('selected', function (newValue) {
          $scope.$emit('country-select-changed', newValue);
        }));

        eventReferences.push($scope.$watch('selectedCountryCode', function (newValue) {
          if (newValue) {
            if (!$scope.selected || ($scope.selected && $scope.selected.code !== _.toNumber(newValue))) {
              setSelectedCountryByCode(newValue);
            }
          }
        }));

        if ($attrs.initialCountry) {
          setSelectedCountryById($attrs.initialCountry);
        }

        // Selects the country automatically if auto-locate is enabled
        if ($scope.autoLocate) {
          geoIpLookup(function(id) {
            setSelectedCountryById(id);
          });
        }

        /**
         * Selects a country by matching country Id
         *
         * @param {any} id
         */
        function setSelectedCountryById(id) {
          var lowerId = _.toLower(id);
          $scope.$apply(function () {
            $scope.selected = _.find($scope.countries, {id: lowerId});
          });
        }

        /**
         * Selects a country by matching the country code
         *
         * @param {any} code
         */
        function setSelectedCountryByCode(code) {
          $scope.selected = _.find($scope.countries, { code : _.toNumber(code) });
        }

        $scope.$on('$destroy', function () {
          _.forEach(eventReferences, function (canceler) {
            if (_.isFunction(canceler)) {
              canceler();
            }
          });
        });
      }

    };

    /**
     * Sends a request and receives the location information
     *
     * @param {any} callback
     */
    function geoIpLookup(callback) {
      $.get("https://ipinfo.io", function() {}, "jsonp").always(function(resp) {
        var countryCode = (resp && resp.country) ? resp.country : "";
        callback(countryCode);
      });
    }

  }

})();
