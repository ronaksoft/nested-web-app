/**
 * @file src/nested/utility/utility.place.service.js
 * @author Soroush Torkzadeh <sorousht@nested.me>
 * @description A set of tools that help you work with place
 * Documented by:          Soroush Torkzadeh <sorousht@nested.me>
 * Date of documentation:  2017-08-07
 * Reviewed by:            -
 * Date of review:         -
 */

(function () {
  'use strict';

  angular
    .module('ronak.nested.web.components.utility')
    .service('NstUtilPlace', NstUtilPlace);

  /** @ngInject */
  /**
   * Utilities to work with Place
   * 
   * @param {any} _ 
   * @returns 
   */
  function NstUtilPlace(_) {
    function PlaceUtility() {

    }
    // The character that separates a nested place Id 
    var PLACE_ID_SEPARATOR = ".";
    PlaceUtility.prototype = {};
    PlaceUtility.prototype.constructor = PlaceUtility;

    /**
     * Returns tru if the provided Place Id belongs to a grand Place.
     * A grand Place Id does not contain any dot (.)
     * example:
     *  company => true
     *  company.technicals => false
     * @param {any} placeId 
     * @returns 
     */
    PlaceUtility.prototype.isGrand = function (placeId) {
      return _.indexOf(placeId, PLACE_ID_SEPARATOR) === -1;
    }

    /**
     * Returns the starting part of the place Id as the grand parent Place Id
     * example:
     *  company => company
     *  company.marketing => company
     *  company.marketing.ads => company
     *  
     * @param {any} placeId 
     * @returns 
     */
    PlaceUtility.prototype.getGrandId = function (placeId) {
      if (this.hasParent(placeId)) {
        var index = _.indexOf(placeId, PLACE_ID_SEPARATOR);
        return placeId.substring(0, index);
      }

      return "";
    }

    /**
     * Returns the parent place Id of the provided Place Id
     * example:
     *  company => company
     *  company.marketing => company
     *  company.technicals.piping => company.technicals
     * @param {any} placeId 
     * @returns 
     */
    PlaceUtility.prototype.getParentId = function (placeId) {
      if (this.hasParent(placeId)) {
        var index = _.lastIndexOf(placeId, PLACE_ID_SEPARATOR);
        return placeId.substring(0, index);
      }

      return "";
    }

    /**
     * Returns the parent Id of the provided place Id at specified level
     * example:
     *  company.technicals.piping.inspection, 0 => company
     *  company.technicals.piping.inspection, 1 => company
     *  company.technicals.piping.inspection, 2 => company.technicals
     *  company.technicals.piping.inspection, 3 => company.technicals.piping
     * @param {any} placeId 
     * @param {any} level 
     * @returns 
     */
    PlaceUtility.prototype.getGrandParentId = function (placeId, level) {
      if (this.hasParent(placeId)) {
        level = level || 1;
        var index = 0;
        while (level > 0) {
          index = _.indexOf(placeId, PLACE_ID_SEPARATOR, index + 1);
          level--;
        }

        return placeId.substring(0, index);
      }

      return "";
    }

    /**
     * Returns true if the provided Place Id contains a dot (.)
     * example:
     *  company => false
     *  company.marketing => true
     * @param {any} placeId 
     * @returns 
     */
    PlaceUtility.prototype.hasParent = function (placeId) {
      return _.indexOf(placeId, PLACE_ID_SEPARATOR) !== -1;
    }

    /**
     * Returns the hierarchical level of the provided Place Id
     * example:
     *  company => 1
     *  company.marketing => 2
     *  company.technicals.piping.inspection => 4
     * @param {any} placeId 
     * @returns 
     */
    PlaceUtility.prototype.getIndentLevel = function (placeId) {
      return _.split(placeId, PLACE_ID_SEPARATOR).length;
    }

    return new PlaceUtility();
  }
})();
